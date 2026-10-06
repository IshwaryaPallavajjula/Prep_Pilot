const Plan = require('../models/Plan')
const AppError = require('../utils/AppError')
const isValidObjectId = require('../utils/isValidObjectId')
const { resolveToday, parseDateOnly, addDaysToKey, toDateKey } = require('../utils/dates')

// --------------------------------------------------
// TASK STATUS WEIGHTS
// --------------------------------------------------

const TASK_STATUS_WEIGHT = {
  DONE: 100,
  PARTIAL: 50,
  SKIPPED: 0,
  PENDING: 0,
}

// --------------------------------------------------
// CALCULATE DAY COMPLETION
// --------------------------------------------------

function calculateDayCompletionPercentage(tasks) {
  if (!tasks || !tasks.length) {
    return 0
  }

  const totalWeight = tasks.reduce(
    (sum, task) =>
      sum + (TASK_STATUS_WEIGHT[task.status] ?? 0),
    0
  )

  return Math.round(totalWeight / tasks.length)
}

// --------------------------------------------------
// TASK PRIORITY
// --------------------------------------------------

function calculateTaskWeight(status) {
  const weights = {
    DONE: 0,
    PARTIAL: 0.5,
    PENDING: 1,
    SKIPPED: 1,
  }

  return weights[status] ?? 1
}

// --------------------------------------------------
// COLLECT PENDING / PARTIAL WORK
// --------------------------------------------------

function collectPendingWork(plan) {
  const pendingWork = []

  for (const day of plan.days) {
    for (const task of day.tasks) {
      if (
        task.status === 'PENDING' ||
        task.status === 'PARTIAL' ||
        task.status === 'SKIPPED'
      ) {
        pendingWork.push({
          originalDay: day.dayNumber,
          originalDate: day.date,
          focus: day.focus,

          taskId: task.taskId,
          title: task.title,
          description: task.description,
          type: task.type,

          estimatedMinutes: task.estimatedMinutes,
          status: task.status,

          priorityWeight: calculateTaskWeight(
            task.status
          ),
        })
      }
    }
  }

  return pendingWork
}

// --------------------------------------------------
// RECOVERY SUMMARY
// --------------------------------------------------

function calculateRecoverySummary(plan) {
  const pendingWork = collectPendingWork(plan)

  const pendingMinutes = pendingWork.reduce(
    (total, task) =>
      total +
      task.estimatedMinutes * task.priorityWeight,
    0
  )

  const missedDays = plan.days.filter((day) =>
    day.tasks.every(
      (task) =>
        task.status === 'PENDING' ||
        task.status === 'SKIPPED'
    )
  ).length

  const partialDays = plan.days.filter((day) =>
    day.tasks.some(
      (task) => task.status === 'PARTIAL'
    )
  ).length

  return {
    pendingTaskCount: pendingWork.length,
    pendingMinutes,
    missedDays,
    partialDays,
  }
}

// --------------------------------------------------
// ANALYZE RECOVERY
// --------------------------------------------------

async function analyzeRecovery(planId) {
  if (!isValidObjectId(planId)) {
    throw new AppError('Invalid plan id', 400)
  }

  const plan = await Plan.findById(planId)

  if (!plan) {
    throw new AppError('Plan not found', 404)
  }

  const pendingWork = collectPendingWork(plan)

  const summary = calculateRecoverySummary(plan)

  return {
    planId: plan._id,
    currentVersion: plan.version,
    interviewDate: plan.interviewDate,

    pendingWork,

    summary,
  }
}

// --------------------------------------------------
// GENERATE ADAPTIVE RECOVERY PLAN
// --------------------------------------------------

async function generateRecoveryPlan(planId, { today } = {}) {
  if (!isValidObjectId(planId)) {
    throw new AppError('Invalid plan id', 400)
  }

  const originalPlan = await Plan.findById(planId)

  if (!originalPlan) {
    throw new AppError('Plan not found', 404)
  }

  const pendingWork = collectPendingWork(originalPlan)

  if (!pendingWork.length) {
    throw new AppError(
      'No pending work available for recovery',
      400
    )
  }

  // Sort:
  // 1. PARTIAL tasks first
  // 2. Older tasks first
  const sortedWork = [...pendingWork].sort((a, b) => {
    if (
      a.status === 'PARTIAL' &&
      b.status !== 'PARTIAL'
    ) {
      return -1
    }

    if (
      a.status !== 'PARTIAL' &&
      b.status === 'PARTIAL'
    ) {
      return 1
    }

    return a.originalDay - b.originalDay
  })

  // Start recovery from the client's today (calendar days, midnight UTC)
  const todayKey = resolveToday(today)
  const interviewKey = toDateKey(originalPlan.interviewDate)

  // Create recovery days only from today until the interview date.
  const recoveryDays = []

  let cursorKey = todayKey
  let dayNumber = 1

  while (cursorKey <= interviewKey && dayNumber <= 60) {
    recoveryDays.push({
      dayNumber,
      date: parseDateOnly(cursorKey),
      focus: '',
      tasks: [],
      estimatedTime: 0,
      completionPercentage: 0,
    })

    cursorKey = addDaysToKey(cursorKey, 1)
    dayNumber++
  }

  if (!recoveryDays.length) {
    throw new AppError(
      'No recovery days available before interview',
      400
    )
  }

  // ------------------------------------------------
  // DISTRIBUTE PENDING WORK
  // ------------------------------------------------

  let targetDayIndex = 0

  for (const work of sortedWork) {
    let targetDay =
      recoveryDays[targetDayIndex]

    // Move to next day if current day
    // already has approximately 120 minutes.
    if (
      targetDay.estimatedTime +
        work.estimatedMinutes >
        120 &&
      targetDay.tasks.length > 0 &&
      targetDayIndex <
        recoveryDays.length - 1
    ) {
      targetDayIndex++

      targetDay =
        recoveryDays[targetDayIndex]
    }

    targetDay.tasks.push({
      taskId: `REC-${work.taskId}`,
      title: work.title,
      description: work.description,
      type: work.type,
      estimatedMinutes:
        work.estimatedMinutes,
      status: 'PENDING',
      timeSpentMinutes: 0,
      completedAt: null,
    })

    targetDay.estimatedTime +=
      work.estimatedMinutes

    // Use original focus when possible
    if (!targetDay.focus) {
      targetDay.focus = work.focus
    } else if (
      !targetDay.focus.includes(work.focus)
    ) {
      targetDay.focus =
        `${targetDay.focus} + ${work.focus}`
    }
  }

  // ------------------------------------------------
  // REMOVE EMPTY DAYS
  // ------------------------------------------------

  const populatedDays =
    recoveryDays.filter(
      (day) => day.tasks.length > 0
    )

  // Renumber recovery days
  populatedDays.forEach((day, index) => {
    day.dayNumber = index + 1

    day.completionPercentage =
      calculateDayCompletionPercentage(
        day.tasks
      )
  })

  // ------------------------------------------------
  // CREATE VERSION 2
  // ------------------------------------------------

  const recoveryPlan = new Plan({
    userId: originalPlan.userId,
    goalId: originalPlan.goalId,

    title:
      `${originalPlan.title} - Adaptive Recovery`,

    startDate: parseDateOnly(todayKey),

    interviewDate:
      originalPlan.interviewDate,

    version:
      originalPlan.version + 1,

    status: 'ACTIVE',

    days: populatedDays,
  })

  // Archive previous version
  originalPlan.status = 'ARCHIVED'

  await originalPlan.save()
  await recoveryPlan.save()

  return {
    originalPlanId: originalPlan._id,
    newPlanId: recoveryPlan._id,

    previousVersion:
      originalPlan.version,

    newVersion:
      recoveryPlan.version,

    recoveryPlan,
  }
}
// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  analyzeRecovery,
  generateRecoveryPlan,
}