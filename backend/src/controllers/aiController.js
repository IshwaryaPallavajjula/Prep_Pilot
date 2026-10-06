const aiService = require('../services/aiService')
const planService = require('../services/planService')
const progressService = require('../services/progressService')
const weakAreaService = require('../services/weakAreaService')
const Goal = require('../models/Goal')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const isValidObjectId = require('../utils/isValidObjectId')
const {
  isDateKey,
  toDateKey,
  addDaysToKey,
  diffDaysBetweenKeys,
  weekdayLabel,
  buildStudyDateKeys,
} = require('../utils/dates')

// Keeps a single Gemini response (and the JSON we ask for) a sensible size.
// Longer horizons are covered by adaptive replanning as the user progresses.
const MAX_PLAN_DAYS = Number(process.env.MAX_PLAN_DAYS) || 21

// Study dates from startKey until the day before the interview, honouring the
// user's chosen study days. Falls back to every day / to just startKey so a
// plan can always be generated.
function computeStudyDateKeys(startKey, interviewKey, studyDays) {
  const lastKey = interviewKey > startKey ? addDaysToKey(interviewKey, -1) : startKey

  let keys = buildStudyDateKeys(startKey, lastKey, studyDays, MAX_PLAN_DAYS)

  if (!keys.length) {
    keys = buildStudyDateKeys(startKey, lastKey, [], MAX_PLAN_DAYS)
  }

  return keys.length ? keys : [startKey]
}

function describeGoalForAI(goal) {
  return {
    targetRole: goal.targetRole,
    targetCompanies: goal.targetCompanies,
    dailyStudyHours: goal.dailyStudyHours,
    studyDays: goal.studyDays,
    preferredStudyTime: goal.preferredStudyTime,
    skillAssessment: goal.skillAssessment,
    topicSelfAssessment: goal.topicAssessment || {},
    preparationPreferences: goal.preparationPreferences,
  }
}

function summarizePlanForAI(plan, todayKey) {
  return {
    title: plan.title,
    version: plan.version,
    startDate: toDateKey(plan.startDate),
    interviewDate: toDateKey(plan.interviewDate),
    days: plan.days.map((day) => {
      const key = toDateKey(day.date)

      return {
        dayNumber: day.dayNumber,
        date: key,
        focus: day.focus,
        timing: key < todayKey ? 'PAST' : key === todayKey ? 'TODAY' : 'UPCOMING',
        tasks: day.tasks.map((task) => ({
          taskId: task.taskId,
          title: task.title,
          type: task.type,
          estimatedMinutes: task.estimatedMinutes,
          status: task.status,
          timeSpentMinutes: task.timeSpentMinutes,
        })),
      }
    }),
  }
}

function formatPlanResponse(plan) {
  return {
    planId: plan._id,
    title: plan.title,
    userId: plan.userId,
    goalId: plan.goalId,
    version: plan.version,
    status: plan.status,
    startDate: plan.startDate,
    interviewDate: plan.interviewDate,
    totalDays: plan.days.length,
    days: plan.days,
  }
}

// -------------------------------------------------------------
// POST /api/ai/generate-plan
// -------------------------------------------------------------

const generatePlan = asyncHandler(async (req, res) => {
  const { goalId, startDate } = req.body

  if (!goalId) {
    throw new AppError('goalId is required', 400)
  }

  if (!isValidObjectId(goalId)) {
    throw new AppError('Invalid goalId', 400)
  }

  // The goal must belong to the signed-in user
  const goal = await Goal.findOne({ _id: goalId, userId: req.userId })

  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

  // Idempotent: a double click (or a retry after a slow response) must not
  // create a second plan for the same goal.
  const existing = await planService.getLatestPlanVersion(req.userId, goalId)

  if (existing) {
    return res.status(200).json({
      success: true,
      message: 'A plan already exists for this goal',
      data: formatPlanResponse(existing),
    })
  }

  const todayKey = req.clientToday
  const startKey = isDateKey(startDate) && startDate >= todayKey ? startDate : todayKey
  const interviewKey = toDateKey(goal.interviewDate)
  const dateKeys = computeStudyDateKeys(startKey, interviewKey, goal.studyDays)

  // 1. Generate personalized plan using Gemini
  const aiPlan = await aiService.generateStudyPlan({
    ...describeGoalForAI(goal),
    today: todayKey,
    startDate: startKey,
    interviewDate: interviewKey,
    daysUntilInterview: Math.max(0, diffDaysBetweenKeys(startKey, interviewKey)),
    planLengthDays: dateKeys.length,
    schedule: dateKeys.map((date, index) => ({
      dayNumber: index + 1,
      date,
      weekday: weekdayLabel(date),
    })),
  })

  // 2. Convert AI response into MongoDB Plan format (real calendar dates)
  const days = planService.buildPlanDays(aiPlan, dateKeys)

  // 3. Save the AI-generated plan in MongoDB
  const savedPlan = await planService.createPlan({
    userId: req.userId,
    goalId,
    title: aiPlan.title,
    startDate: days[0].date,
    interviewDate: goal.interviewDate,
    version: 1,
    status: 'ACTIVE',
    days,
    adaptation: {
      action: 'INITIAL',
      focusArea: days[0].focus,
      reason: 'Generated by PrepPilot from your goal, availability and skill assessment.',
      priority: 'LOW',
      recommendations: [],
      planUpdated: true,
    },
  })

  res.status(201).json({
    success: true,
    message: 'AI study plan generated and saved successfully',
    data: formatPlanResponse(savedPlan),
  })
})

// -------------------------------------------------------------
// POST /api/ai/adapt-plan
//
// Everything the AI looks at (plan, progress, deviation, weak areas) is read
// from the database on the server - never taken from the request body.
// -------------------------------------------------------------

const adaptPlan = asyncHandler(async (req, res) => {
  const { planId, userRequested } = req.body
  const todayKey = req.clientToday

  const currentPlan = await planService.getPlanById(planId)

  if (currentPlan.status !== 'ACTIVE') {
    throw new AppError('This plan version is archived. Refresh to see your current plan.', 409)
  }

  const goal = await Goal.findOne({ _id: currentPlan.goalId, userId: req.userId })

  if (!goal) {
    throw new AppError('Goal not found for this plan', 404)
  }

  const [progress, deviation, weakAreaResult] = await Promise.all([
    progressService.getPlanProgress(planId),
    progressService.getPlanDeviation(planId, { today: todayKey }),
    weakAreaService.getWeakAreas(planId),
  ])

  const weakAreas = weakAreaResult.weakAreas.slice(0, 5).map((area) => ({
    topic: area.topic,
    completionPercentage: area.completionPercentage,
    pendingTasks: area.pendingTasks,
    partialTasks: area.partialTasks,
    skippedTasks: area.skippedTasks,
    weaknessScore: area.weaknessScore,
  }))

  const wantsReplan = userRequested === 'REPLAN'

  // -----------------------------------------
  // 1. Ask Gemini what should happen
  // -----------------------------------------

  const adaptation = await aiService.adaptStudyPlan({
    today: todayKey,
    goal: describeGoalForAI(goal),
    plan: summarizePlanForAI(currentPlan, todayKey),
    progress,
    deviation,
    weakAreas,
    ...(wantsReplan ? { studentRequest: 'REPLAN' } : {}),
  })

  // An explicit request from the student always results in a new plan version
  if (wantsReplan) {
    adaptation.action = 'REPLAN'
  }

  const summary = {
    action: adaptation.action,
    focusArea: adaptation.focusArea,
    suggestedMinutes: adaptation.suggestedMinutes,
    reason: adaptation.reason,
    priority: adaptation.priority,
    recommendations: adaptation.recommendations,
  }

  // -----------------------------------------
  // 2. CONTINUE - nothing changes, but the analysis is remembered
  // -----------------------------------------

  if (adaptation.action === 'CONTINUE') {
    await planService.saveLastAnalysis(planId, summary, false)

    return res.status(200).json({
      success: true,
      message: 'Current study plan should continue',
      data: { ...summary, planUpdated: false, deviation, progress },
    })
  }

  // -----------------------------------------
  // 3. ADJUST - a catch-up session is added to the upcoming schedule
  // -----------------------------------------

  if (adaptation.action === 'ADJUST') {
    const { plan, addedTaskId, addedToDay } = await planService.applyAdjustment(
      planId,
      summary,
      todayKey
    )

    return res.status(200).json({
      success: true,
      message: 'AI recommended plan adjustment',
      data: {
        ...summary,
        planUpdated: true,
        addedTaskId,
        addedToDay,
        plan,
        deviation,
        progress,
      },
    })
  }

  // -----------------------------------------
  // 4. REPLAN - a brand new plan version starting today
  // -----------------------------------------

  if (adaptation.action === 'REPLAN') {
    const interviewKey = toDateKey(currentPlan.interviewDate)
    const dateKeys = computeStudyDateKeys(todayKey, interviewKey, goal.studyDays)

    const allTasks = currentPlan.days.flatMap((day) =>
      day.tasks.map((task) => ({ focus: day.focus, title: task.title, status: task.status }))
    )

    const aiPlan = await aiService.generateStudyPlan({
      ...describeGoalForAI(goal),
      today: todayKey,
      startDate: todayKey,
      interviewDate: interviewKey,
      daysUntilInterview: Math.max(0, diffDaysBetweenKeys(todayKey, interviewKey)),
      planLengthDays: dateKeys.length,
      schedule: dateKeys.map((date, index) => ({
        dayNumber: index + 1,
        date,
        weekday: weekdayLabel(date),
      })),
      weakAreas,
      progress,
      deviation,
      replanReason: adaptation.reason,
      focusArea: adaptation.focusArea,
      completedWork: allTasks.filter((task) => task.status === 'DONE').map((task) => `${task.focus}: ${task.title}`),
      pendingWork: allTasks
        .filter((task) => task.status !== 'DONE')
        .map((task) => `${task.focus}: ${task.title} (${task.status})`),
    })

    const days = planService.buildPlanDays(aiPlan, dateKeys)

    const newPlan = await planService.createPlanVersion({
      previousPlan: currentPlan,
      days,
      title: aiPlan.title,
      startDate: days[0].date,
      interviewDate: currentPlan.interviewDate,
      adaptation: { ...summary, planUpdated: true },
    })

    return res.status(200).json({
      success: true,
      message: 'AI generated a new adaptive plan version',
      data: {
        ...summary,
        planUpdated: true,
        previousPlanId: currentPlan._id,
        newPlanId: newPlan._id,
        newVersion: newPlan.version,
        plan: newPlan,
        deviation,
        progress,
      },
    })
  }

  throw new AppError('Unsupported AI adaptation action', 500)
})

module.exports = {
  generatePlan,
  adaptPlan,
}
