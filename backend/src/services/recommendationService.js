const { GoogleGenerativeAI } = require('@google/generative-ai')
const AppError = require('../utils/AppError')
const Plan = require('../models/Plan')
const Goal = require('../models/Goal')
const weakAreaService = require('./weakAreaService')

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not configured')
}

const genAI = apiKey
  ? new GoogleGenerativeAI(apiKey)
  : null

function cleanAIResponse(text) {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()
}

async function generateRecommendation(planId) {
  if (!genAI) {
    throw new AppError(
      'GEMINI_API_KEY is not configured',
      500
    )
  }

  const plan = await Plan.findById(planId)

  if (!plan) {
    throw new AppError('Plan not found', 404)
  }

  const goal = await Goal.findById(plan.goalId)

  // Get our deterministic weak-area analysis
  const weakAreaAnalysis =
    await weakAreaService.getWeakAreas(planId)

  const allTasks = plan.days.flatMap((day) =>
    day.tasks.map((task) => ({
      dayNumber: day.dayNumber,
      focus: day.focus,
      taskId: task.taskId,
      title: task.title,
      type: task.type,
      estimatedMinutes: task.estimatedMinutes,
      status: task.status,
      timeSpentMinutes: task.timeSpentMinutes,
    }))
  )

  const completedTasks = allTasks.filter(
    (task) => task.status === 'DONE'
  )

  const partialTasks = allTasks.filter(
    (task) => task.status === 'PARTIAL'
  )

  const pendingTasks = allTasks.filter(
    (task) => task.status === 'PENDING'
  )

  const skippedTasks = allTasks.filter(
    (task) => task.status === 'SKIPPED'
  )

  const totalTasks = allTasks.length

  const completionPercentage =
    totalTasks > 0
      ? Math.round(
          (completedTasks.length / totalTasks) * 100
        )
      : 0

  const prompt = `
You are PrepPilot, an intelligent adaptive interview preparation coach.

Your job is to analyze the user's preparation data and provide ONE
high-value, personalized next-step recommendation.

Do NOT give generic motivation.

Use the actual progress and weak-area analysis.

USER GOAL:
${JSON.stringify(goal, null, 2)}

PLAN:
${JSON.stringify(
  {
    planId: plan._id,
    title: plan.title,
    startDate: plan.startDate,
    interviewDate: plan.interviewDate,
    version: plan.version,
  },
  null,
  2
)}

CURRENT TASKS:
${JSON.stringify(allTasks, null, 2)}

WEAK AREA ANALYSIS:
${JSON.stringify(
  weakAreaAnalysis.weakAreas,
  null,
  2
)}

PROGRESS SUMMARY:
Total tasks: ${totalTasks}
Completed: ${completedTasks.length}
Partial: ${partialTasks.length}
Pending: ${pendingTasks.length}
Skipped: ${skippedTasks.length}
Completion percentage: ${completionPercentage}

Return ONLY valid JSON.

Required structure:

{
  "recommendation": "string",
  "priority": "LOW",
  "reason": "string",
  "suggestedMinutes": 30,
  "focusArea": "string",
  "actions": [
    "string"
  ]
}

Rules:

1. Use the weak-area analysis when deciding the recommendation.
2. Prioritize incomplete or partially completed work.
3. If a task is PARTIAL, consider recommending completion of that task.
4. If a topic has many pending tasks, consider it a weak area.
5. Consider the user's target role and interview date.
6. Do not invent user information.
7. suggestedMinutes must be a positive integer.
8. priority must be exactly LOW, MEDIUM or HIGH.
9. Provide 1 to 3 concrete actions.
10. Keep the recommendation practical.
11. Do not recommend skipping important preparation without evidence.
12. Return only JSON.
`

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
  })

  try {
    let result

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await model.generateContent(prompt)
        break
      } catch (error) {
        if (error?.status !== 503 || attempt === 3) {
          throw error
        }

        console.log(
          `Gemini temporarily unavailable. Retrying (${attempt}/3)...`
        )

        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 3000)
        )
      }
    }

    const text = result.response.text()
    const cleaned = cleanAIResponse(text)

    let recommendation

    try {
      recommendation = JSON.parse(cleaned)
    } catch (error) {
      console.error(
        'Gemini raw recommendation:',
        text
      )

      throw new AppError(
        'AI returned invalid recommendation JSON',
        500
      )
    }

    if (
      !recommendation.recommendation ||
      !recommendation.reason ||
      !recommendation.focusArea ||
      !Array.isArray(recommendation.actions)
    ) {
      throw new AppError(
        'AI returned an incomplete recommendation',
        500
      )
    }

    if (
      !['LOW', 'MEDIUM', 'HIGH'].includes(
        recommendation.priority
      )
    ) {
      throw new AppError(
        'AI returned an invalid recommendation priority',
        500
      )
    }

    return {
      planId: plan._id,
      goalId: plan.goalId,
      completionPercentage,
      weakAreas: weakAreaAnalysis.weakAreas,
      recommendation: recommendation.recommendation,
      priority: recommendation.priority,
      reason: recommendation.reason,
      suggestedMinutes:
        recommendation.suggestedMinutes,
      focusArea: recommendation.focusArea,
      actions: recommendation.actions,
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    console.error(
      'Gemini recommendation error:',
      error
    )

    throw new AppError(
      'Failed to generate AI recommendation',
      500
    )
  }
}

module.exports = {
  generateRecommendation,
}