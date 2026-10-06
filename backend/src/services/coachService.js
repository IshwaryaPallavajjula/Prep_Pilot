const { GoogleGenerativeAI } = require('@google/generative-ai')
const Plan = require('../models/Plan')
const Goal = require('../models/Goal')
const AppError = require('../utils/AppError')
const isValidObjectId = require('../utils/isValidObjectId')

const apiKey = process.env.GEMINI_API_KEY

const genAI = apiKey
  ? new GoogleGenerativeAI(apiKey)
  : null

async function getCoachResponse(planId, userMessage) {
  if (!isValidObjectId(planId)) {
    throw new AppError('Invalid plan id', 400)
  }

  if (!userMessage || !userMessage.trim()) {
    throw new AppError('User message is required', 400)
  }

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

  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

  const tasks = plan.days.flatMap(
    (day) => day.tasks || []
  )

  const completedTasks = tasks.filter(
    (task) => task.status === 'DONE'
  ).length

  const pendingTasks = tasks.filter(
    (task) => task.status === 'PENDING'
  ).length

  const partialTasks = tasks.filter(
    (task) => task.status === 'PARTIAL'
  ).length

  const skippedTasks = tasks.filter(
    (task) => task.status === 'SKIPPED'
  ).length

  const totalTasks = tasks.length

  const completionPercentage = totalTasks
    ? Math.round(
        (
          completedTasks * 100 +
          partialTasks * 50
        ) / totalTasks
      )
    : 0

  const context = {
    goal,
    plan: {
      title: plan.title,
      interviewDate: plan.interviewDate,
      version: plan.version,
      status: plan.status,
    },
    progress: {
      completionPercentage,
      totalTasks,
      completedTasks,
      pendingTasks,
      partialTasks,
      skippedTasks,
    },
    currentPlan: plan.days.map((day) => ({
      dayNumber: day.dayNumber,
      focus: day.focus,
      tasks: day.tasks.map((task) => ({
        title: task.title,
        type: task.type,
        status: task.status,
      })),
    })),
  }

  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  })

  const prompt = `
You are PrepPilot AI Interview Coach.

Your job is to help the user prepare for their interview.

Use ONLY the information provided in the user context.
Do not invent companies, skills, experience, interview requirements,
scores, or personal information.

USER CONTEXT:
${JSON.stringify(context, null, 2)}

USER MESSAGE:
${userMessage}

Give a practical, personalized response.

If the user asks about a technical concept:
- Explain it clearly.
- Give a simple example.
- Relate it to interview preparation.
- Give one small practice question.

If the user asks what to study next:
- Use the current plan and progress.
- Prioritize pending or weak areas.

If the user asks for interview practice:
- Ask one interview-style question at a time.
- Do not immediately reveal the answer unless requested.

If the user appears stuck:
- Break the concept into smaller steps.

Keep the response concise but useful.
`

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

    const response = result.response.text()

    return {
      planId: plan._id,
      completionPercentage,
      response: response.trim(),
    }
  } catch (error) {
    console.error('Coach Gemini error:', error)

    throw new AppError(
      'Failed to generate AI coach response',
      500
    )
  }
}

module.exports = {
  getCoachResponse,
}