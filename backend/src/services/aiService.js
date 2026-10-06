const { GoogleGenerativeAI } = require('@google/generative-ai')
const AppError = require('../utils/AppError')

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not configured')
}

const genAI = apiKey
  ? new GoogleGenerativeAI(apiKey)
  : null

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'

const ALLOWED_TASK_TYPES = [
  'LEARN',
  'PRACTICE',
  'REVISION',
  'MOCK_INTERVIEW',
  'CS_FUNDAMENTALS',
  'SYSTEM_DESIGN',
]

// Common near-misses Gemini produces, mapped onto the allowed task types.
const TASK_TYPE_ALIASES = {
  DSA: 'PRACTICE',
  CODING: 'PRACTICE',
  PROBLEM_SOLVING: 'PRACTICE',
  STUDY: 'LEARN',
  THEORY: 'LEARN',
  READING: 'LEARN',
  REVIEW: 'REVISION',
  MOCK: 'MOCK_INTERVIEW',
  INTERVIEW: 'MOCK_INTERVIEW',
  CS: 'CS_FUNDAMENTALS',
  CS_FUNDAMENTAL: 'CS_FUNDAMENTALS',
  FUNDAMENTALS: 'CS_FUNDAMENTALS',
  DESIGN: 'SYSTEM_DESIGN',
  SYSTEMDESIGN: 'SYSTEM_DESIGN',
}

function cleanAIResponse(text) {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()
}

function normalizeTaskType(type) {
  if (typeof type !== 'string') return type

  const key = type.trim().toUpperCase().replace(/[\s-]+/g, '_')

  if (ALLOWED_TASK_TYPES.includes(key)) return key

  return TASK_TYPE_ALIASES[key] || key
}

// Turn low-level Gemini failures into messages a user can act on.
function toUserFacingAIError(error, fallbackMessage) {
  if (error instanceof AppError) return error

  const status = error?.status || error?.statusCode

  if (status === 429) {
    return new AppError('The AI service is receiving too many requests right now. Please try again in a minute.', 429)
  }

  if (status === 503 || status === 500) {
    return new AppError('The AI service is temporarily busy. Please try again in a moment.', 503)
  }

  if (status === 400 || status === 401 || status === 403 || status === 404) {
    return new AppError(
      'The AI service rejected the request. Check GEMINI_API_KEY and GEMINI_MODEL in backend/.env.',
      502
    )
  }

  return new AppError(fallbackMessage, 502)
}

function validateStudyPlan(plan) {
  if (!plan || typeof plan !== 'object') {
    throw new AppError('AI returned an invalid plan', 500)
  }

  if (!plan.title || typeof plan.title !== 'string') {
    throw new AppError('AI plan title is missing', 500)
  }

  if (!Array.isArray(plan.days) || plan.days.length === 0) {
    throw new AppError('AI plan contains no days', 500)
  }

  plan.days.forEach((day, dayIndex) => {
    if (!day.dayNumber) {
      throw new AppError(
        `AI plan day ${dayIndex + 1} has no dayNumber`,
        500
      )
    }

    if (!day.focus) {
      throw new AppError(
        `AI plan day ${day.dayNumber} has no focus`,
        500
      )
    }

    if (!Array.isArray(day.tasks)) {
      throw new AppError(
        `AI plan day ${day.dayNumber} has invalid tasks`,
        500
      )
    }

    day.tasks.forEach((task, taskIndex) => {
      if (!task.title) {
        throw new AppError(
          `AI task ${day.dayNumber}-${taskIndex + 1} has no title`,
          500
        )
      }

      if (!task.description) {
        task.description = ''
      }

      task.type = normalizeTaskType(task.type)

      if (!ALLOWED_TASK_TYPES.includes(task.type)) {
        throw new AppError(
          `AI returned invalid task type: ${task.type}`,
          500
        )
      }

      // Gemini occasionally returns "45" instead of 45
      if (typeof task.estimatedMinutes === 'string') {
        task.estimatedMinutes = Number(task.estimatedMinutes)
      }

      if (
        typeof task.estimatedMinutes !== 'number' ||
        Number.isNaN(task.estimatedMinutes) ||
        task.estimatedMinutes <= 0
      ) {
        throw new AppError(
          `AI task ${day.dayNumber}-${taskIndex + 1} has invalid estimatedMinutes`,
          500
        )
      }
    })
  })

  return plan
}

// One Gemini call with the existing "retry when the service is briefly
// unavailable" behaviour.
async function callGemini(model, prompt) {
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

  return result.response.text()
}

async function generateStudyPlan(input) {
  if (!genAI) {
    throw new AppError(
      'GEMINI_API_KEY is not configured',
      500
    )
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
  })

  const planLengthRule = input?.planLengthDays
    ? `\n15. The plan MUST contain exactly ${input.planLengthDays} days, numbered 1 to ${input.planLengthDays}.`
    : ''

  const prompt = `
You are PrepPilot, an intelligent and adaptive interview preparation planner.

Create a personalized interview preparation study plan using ONLY the information provided below.

USER INFORMATION:
${JSON.stringify(input, null, 2)}

Return ONLY valid JSON.
Do not use Markdown.
Do not add explanations before or after the JSON.

Required structure:

{
  "title": "string",
  "days": [
    {
      "dayNumber": 1,
      "focus": "string",
      "tasks": [
        {
          "taskId": "D1-T1",
          "title": "string",
          "description": "string",
          "type": "LEARN",
          "estimatedMinutes": 30
        }
      ]
    }
  ]
}

Allowed task types:
LEARN
PRACTICE
REVISION
MOCK_INTERVIEW
CS_FUNDAMENTALS
SYSTEM_DESIGN

Rules:

1. Personalize the plan according to the user's goal.
2. Prioritize weak areas if weak areas are provided.
3. Include learning, practice and revision.
4. Include interview-oriented tasks when appropriate.
5. Include CS fundamentals when relevant to the user's target role.
6. Include mock interviews when appropriate.
7. Keep each day realistic.
8. estimatedMinutes must be a positive integer.
9. Do not invent personal information.
10. Every task must have a unique taskId.
11. Keep the number of tasks manageable (typically 3 to 5 per day).
12. Do not include status, completedAt, timeSpentMinutes or completionPercentage.
13. Do not include MongoDB IDs.
14. Return only the requested JSON structure.${planLengthRule}
16. If dailyStudyHours is provided, the tasks of each day should add up to roughly dailyStudyHours x 60 minutes.
17. If skill levels are provided, spend more time on the areas rated Beginner and less on those rated Strong or Confident.
18. If mock interviews are excluded in the preferences, do not use the MOCK_INTERVIEW type.
19. If pendingWork or completedWork is provided, do not repeat completed work and fold the pending work in first.
`

  try {
    let plan
    let lastRawText = ''

    // One retry when Gemini returns something that is not valid JSON.
    for (let attempt = 1; attempt <= 2; attempt++) {
      const text = await callGemini(model, prompt)
      lastRawText = text

      try {
        plan = JSON.parse(cleanAIResponse(text))
        break
      } catch (error) {
        if (attempt === 2) {
          console.error('Gemini raw response:', lastRawText)

          throw new AppError(
            'AI returned invalid JSON. Please try again.',
            502
          )
        }
      }
    }

    return validateStudyPlan(plan)
  } catch (error) {
    if (!(error instanceof AppError)) {
      console.error('Gemini error:', error)
    }

    throw toUserFacingAIError(error, 'Failed to generate study plan using AI')
  }
}

async function adaptStudyPlan(input) {
  if (!genAI) {
    throw new AppError(
      'GEMINI_API_KEY is not configured',
      500
    )
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
  })

  const prompt = `
You are PrepPilot, an intelligent adaptive interview preparation coach.

Analyze the student's current interview preparation progress and determine
what should happen next.

STUDENT DATA:
${JSON.stringify(input, null, 2)}

Your job is to:
1. Analyze completed, pending, partial and skipped tasks.
2. Analyze the deviation information.
3. Identify the weakest or most delayed area.
4. Decide whether the student should CONTINUE, ADJUST, or REPLAN.
5. Give a practical recommendation for the next study session.
6. Do not invent information that is not present in the input.
7. Do not modify completed tasks.
8. Do not mark future tasks as missed.
9. Keep recommendations realistic.
10. If studentRequest is "REPLAN", the student explicitly asked for a new plan: the action must be REPLAN and the reason should explain what the new plan will focus on.

Return ONLY valid JSON.

Required structure:

{
  "action": "CONTINUE",
  "focusArea": "string",
  "suggestedMinutes": 60,
  "reason": "string",
  "priority": "LOW",
  "recommendations": [
    "string"
  ]
}

Allowed action values:
CONTINUE
ADJUST
REPLAN

Allowed priority values:
LOW
MEDIUM
HIGH

Rules:
- CONTINUE means the current plan can continue without modification.
- ADJUST means the student needs a small change in focus or workload.
- REPLAN means substantial plan changes are needed.
- suggestedMinutes must be a positive integer.
- recommendations must contain practical study actions.
- Return only JSON.
`

  try {
    let adaptation

    for (let attempt = 1; attempt <= 2; attempt++) {
      const text = await callGemini(model, prompt)

      try {
        adaptation = JSON.parse(cleanAIResponse(text))
        break
      } catch (error) {
        if (attempt === 2) {
          console.error('Gemini adaptation raw response:', text)

          throw new AppError(
            'AI returned invalid adaptation JSON. Please try again.',
            502
          )
        }
      }
    }

    if (!adaptation || typeof adaptation !== 'object') {
      throw new AppError(
        'AI returned an invalid adaptation',
        500
      )
    }

    if (typeof adaptation.action === 'string') {
      adaptation.action = adaptation.action.trim().toUpperCase()
    }

    if (typeof adaptation.priority === 'string') {
      adaptation.priority = adaptation.priority.trim().toUpperCase()
    }

    if (typeof adaptation.suggestedMinutes === 'string') {
      adaptation.suggestedMinutes = Number(adaptation.suggestedMinutes)
    }

    const allowedActions = [
      'CONTINUE',
      'ADJUST',
      'REPLAN',
    ]

    const allowedPriorities = [
      'LOW',
      'MEDIUM',
      'HIGH',
    ]

    if (!allowedActions.includes(adaptation.action)) {
      throw new AppError(
        'AI returned an invalid adaptation action',
        500
      )
    }

    if (!allowedPriorities.includes(adaptation.priority)) {
      throw new AppError(
        'AI returned an invalid adaptation priority',
        500
      )
    }

    if (
      !adaptation.focusArea ||
      typeof adaptation.focusArea !== 'string'
    ) {
      throw new AppError(
        'AI adaptation focusArea is missing',
        500
      )
    }

    if (
      typeof adaptation.suggestedMinutes !== 'number' ||
      Number.isNaN(adaptation.suggestedMinutes) ||
      adaptation.suggestedMinutes <= 0
    ) {
      throw new AppError(
        'AI adaptation suggestedMinutes is invalid',
        500
      )
    }

    if (
      !adaptation.reason ||
      typeof adaptation.reason !== 'string'
    ) {
      throw new AppError(
        'AI adaptation reason is missing',
        500
      )
    }

    if (!Array.isArray(adaptation.recommendations)) {
      throw new AppError(
        'AI adaptation recommendations are invalid',
        500
      )
    }

    adaptation.recommendations = adaptation.recommendations
      .filter((item) => typeof item === 'string' && item.trim())
      .map((item) => item.trim())

    return adaptation
  } catch (error) {
    if (!(error instanceof AppError)) {
      console.error('Gemini adaptation error:', error)
    }

    throw toUserFacingAIError(error, 'Failed to generate AI study adaptation')
  }
}

module.exports = {
  generateStudyPlan,
  adaptStudyPlan,
  validateStudyPlan,
}
