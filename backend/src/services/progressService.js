const Plan = require('../models/Plan')
const AppError = require('../utils/AppError')
const isValidObjectId = require('../utils/isValidObjectId')
const { toDateKey, diffDaysBetweenKeys, resolveToday } = require('../utils/dates')

const TASK_STATUS_WEIGHT = {
  DONE: 100,
  PARTIAL: 50,
  SKIPPED: 0,
  PENDING: 0,
}

const ALLOWED_STATUSES = ['PENDING', 'PARTIAL', 'DONE', 'SKIPPED']

// ---------------------------------------------
// CALCULATION HELPERS
// ---------------------------------------------

function calculateCompletionPercentage(tasks) {
  if (!tasks.length) return 0

  const totalWeight = tasks.reduce(
    (sum, task) => sum + (TASK_STATUS_WEIGHT[task.status] ?? 0),
    0
  )

  return Math.round(totalWeight / tasks.length)
}

function calculateTaskCounts(tasks) {
  return {
    total: tasks.length,
    done: tasks.filter((task) => task.status === 'DONE').length,
    partial: tasks.filter((task) => task.status === 'PARTIAL').length,
    skipped: tasks.filter((task) => task.status === 'SKIPPED').length,
    pending: tasks.filter((task) => task.status === 'PENDING').length,
  }
}

function calculatePlannedMinutes(tasks) {
  return tasks.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0)
}

function calculateActualMinutes(tasks) {
  return tasks.reduce((sum, task) => sum + (task.timeSpentMinutes || 0), 0)
}

async function findPlan(planId) {
  if (!isValidObjectId(planId)) {
    throw new AppError('Invalid plan id', 400)
  }

  const plan = await Plan.findById(planId)

  if (!plan) {
    throw new AppError('Plan not found', 404)
  }

  return plan
}

function findDay(plan, dayNumber) {
  const day = plan.days.find((item) => item.dayNumber === Number(dayNumber))

  if (!day) {
    throw new AppError('Day not found in this plan', 404)
  }

  return day
}

// =============================================
// UPDATE TASK PROGRESS
// =============================================

async function updateTaskProgress({ planId, taskId, status, timeSpentMinutes }) {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new AppError('Invalid task status', 400)
  }

  if (
    timeSpentMinutes !== undefined &&
    (typeof timeSpentMinutes !== 'number' || Number.isNaN(timeSpentMinutes) || timeSpentMinutes < 0)
  ) {
    throw new AppError('timeSpentMinutes must be a non-negative number', 400)
  }

  const plan = await findPlan(planId)

  if (plan.status !== 'ACTIVE') {
    throw new AppError(
      'This plan version is archived. Refresh to see your current plan.',
      409
    )
  }

  let targetTask = null
  let targetDay = null

  for (const day of plan.days || []) {
    const task = (day.tasks || []).find((item) => item.taskId === taskId)

    if (task) {
      targetTask = task
      targetDay = day
      break
    }
  }

  if (!targetTask) {
    throw new AppError('Task not found in this plan', 404)
  }

  targetTask.status = status

  if (timeSpentMinutes !== undefined) {
    targetTask.timeSpentMinutes = timeSpentMinutes
  }

  targetTask.completedAt = status === 'DONE' ? new Date() : null

  const tasks = targetDay.tasks || []

  targetDay.completionPercentage = calculateCompletionPercentage(tasks)
  targetDay.estimatedTime = calculatePlannedMinutes(tasks)

  await plan.save()

  return {
    planId: plan._id,
    dayNumber: targetDay.dayNumber,
    task: targetTask,
    dayCompletionPercentage: targetDay.completionPercentage,
  }
}

// =============================================
// GET DAY PROGRESS
// =============================================

async function getDayProgress(planId, dayNumber) {
  const plan = await findPlan(planId)
  const day = findDay(plan, dayNumber)
  const tasks = day.tasks || []

  return {
    planId: plan._id,
    dayNumber: day.dayNumber,
    date: day.date,
    focus: day.focus,
    completionPercentage: calculateCompletionPercentage(tasks),
    plannedMinutes: calculatePlannedMinutes(tasks),
    actualMinutes: calculateActualMinutes(tasks),
    taskCounts: calculateTaskCounts(tasks),
    tasks,
  }
}

// =============================================
// GET PLAN PROGRESS
// =============================================

async function getPlanProgress(planId) {
  const plan = await findPlan(planId)
  const days = plan.days || []
  const allTasks = days.flatMap((day) => day.tasks || [])

  const totalWeight = allTasks.reduce(
    (sum, task) => sum + (TASK_STATUS_WEIGHT[task.status] ?? 0),
    0
  )

  const daysStarted = days.filter((day) =>
    (day.tasks || []).some((task) => task.status !== 'PENDING')
  ).length

  const daysCompleted = days.filter((day) => {
    const tasks = day.tasks || []
    return tasks.length > 0 && tasks.every((task) => task.status === 'DONE')
  }).length

  return {
    planId: plan._id,
    goalId: plan.goalId,
    title: plan.title,
    version: plan.version,
    startDate: plan.startDate,
    interviewDate: plan.interviewDate,
    totalDays: days.length,
    daysStarted,
    daysCompleted,
    averageCompletion: allTasks.length ? Math.round(totalWeight / allTasks.length) : 0,
    totalPlannedMinutes: calculatePlannedMinutes(allTasks),
    totalActualMinutes: calculateActualMinutes(allTasks),
    taskCounts: calculateTaskCounts(allTasks),
  }
}

// =============================================
// DEVIATION DETECTION
//
// Only days that are already "due" can be missed. A day is due once its
// calendar date is before today. Today's own tasks count as missed only when
// the user has explicitly skipped every one of them. Future days are never
// penalised - a brand new plan therefore starts with NO deviation.
// =============================================

function dayDateKey(day) {
  return toDateKey(day.date)
}

function isDayMissed(day, todayKey) {
  const tasks = day.tasks || []
  if (!tasks.length) return false

  const key = dayDateKey(day)
  const nothingDone = tasks.every(
    (task) => task.status === 'PENDING' || task.status === 'SKIPPED'
  )

  if (key < todayKey) return nothingDone // past day with no real work done
  if (key === todayKey) return tasks.every((task) => task.status === 'SKIPPED') // explicitly given up

  return false
}

function detectDayDeviation(day, todayKey) {
  const tasks = day.tasks || []
  const key = dayDateKey(day)

  const completionPercentage = calculateCompletionPercentage(tasks)
  const plannedMinutes = calculatePlannedMinutes(tasks)
  const actualMinutes = calculateActualMinutes(tasks)

  const empty = {
    deviationDetected: false,
    severity: 'NONE',
    reasons: [],
    completionPercentage,
    plannedMinutes,
    actualMinutes,
  }

  if (!tasks.length || key > todayKey) return empty // upcoming: nothing to judge yet

  const reasons = []
  const hasPendingLeft = tasks.some((task) => task.status === 'PENDING')
  const dayIsOver = key < todayKey

  if (isDayMissed(day, todayKey)) {
    reasons.push('MISSED_DAY')
  }

  if (completionPercentage > 0 && completionPercentage < 100 && (dayIsOver || !hasPendingLeft)) {
    reasons.push('PARTIAL_COMPLETION')
  }

  if (
    plannedMinutes > 0 &&
    (dayIsOver || !hasPendingLeft) &&
    actualMinutes < plannedMinutes * 0.5 &&
    !reasons.includes('MISSED_DAY')
  ) {
    reasons.push('TIME_SHORTAGE')
  }

  let severity = 'NONE'

  if (reasons.includes('MISSED_DAY')) {
    severity = 'HIGH'
  } else if (reasons.includes('TIME_SHORTAGE') || (reasons.length && completionPercentage < 50)) {
    severity = 'MEDIUM'
  } else if (reasons.length > 0) {
    severity = 'LOW'
  }

  return {
    deviationDetected: reasons.length > 0,
    severity,
    reasons,
    completionPercentage,
    plannedMinutes,
    actualMinutes,
  }
}

async function getDayDeviation(planId, dayNumber, { today } = {}) {
  const todayKey = resolveToday(today)
  const plan = await findPlan(planId)
  const day = findDay(plan, dayNumber)

  return {
    planId: plan._id,
    dayNumber: day.dayNumber,
    date: day.date,
    focus: day.focus,
    ...detectDayDeviation(day, todayKey),
  }
}

async function getPlanDeviation(planId, { today } = {}) {
  const todayKey = resolveToday(today)
  const plan = await findPlan(planId)
  const days = [...(plan.days || [])].sort((a, b) => a.dayNumber - b.dayNumber)
  const allTasks = days.flatMap((day) => day.tasks || [])

  const totalWeight = allTasks.reduce(
    (sum, task) => sum + (TASK_STATUS_WEIGHT[task.status] ?? 0),
    0
  )

  const overallCompletion = allTasks.length ? Math.round(totalWeight / allTasks.length) : 0
  const taskCounts = calculateTaskCounts(allTasks)

  // ---- missed days (only days that are due) ----
  let missedDays = 0
  let consecutiveMissedDays = 0
  let currentRun = 0

  for (const day of days) {
    if (dayDateKey(day) > todayKey) break // future days are not judged

    if (isDayMissed(day, todayKey)) {
      missedDays += 1
      currentRun += 1
      consecutiveMissedDays = Math.max(consecutiveMissedDays, currentRun)
    } else if (dayDateKey(day) < todayKey || (day.tasks || []).some((t) => t.status !== 'PENDING')) {
      currentRun = 0
    }
  }

  const completedDays = days.filter((day) => {
    const tasks = day.tasks || []
    return tasks.length > 0 && tasks.every((task) => task.status === 'DONE')
  }).length

  // ---- expected progress: the share of the plan whose day is already behind us ----
  const dueTasks = days
    .filter((day) => dayDateKey(day) < todayKey)
    .flatMap((day) => day.tasks || [])

  const expectedCompletion = allTasks.length
    ? Math.max(0, Math.min(100, Math.round((dueTasks.length / allTasks.length) * 100)))
    : 0

  // Progress on days that are due, measured against what was due, so that work
  // done ahead of schedule does not hide a slipping past.
  const progressGap = overallCompletion - expectedCompletion

  let progressStatus = 'ON_TRACK'

  if (progressGap >= 10) {
    progressStatus = 'AHEAD'
  } else if (progressGap <= -10) {
    progressStatus = 'BEHIND'
  }

  // ---- severity ----
  const dueSkipped = days
    .filter((day) => dayDateKey(day) <= todayKey)
    .flatMap((day) => day.tasks || [])
    .filter((task) => task.status === 'SKIPPED').length

  let severity = 'NONE'

  if (consecutiveMissedDays >= 3) {
    severity = 'HIGH'
  } else if (missedDays >= 2 || progressGap <= -20 || dueSkipped >= 3) {
    severity = 'MEDIUM'
  } else if (
    missedDays >= 1 ||
    progressGap <= -10 ||
    taskCounts.partial > 0 ||
    dueSkipped > 0
  ) {
    severity = 'LOW'
  }

  let recommendedAction = 'CONTINUE'

  if (severity === 'HIGH') {
    recommendedAction = 'REPLAN'
  } else if (severity === 'MEDIUM') {
    recommendedAction = 'ADJUST'
  } else if (severity === 'LOW') {
    recommendedAction = 'MONITOR'
  }

  const interviewKey = toDateKey(plan.interviewDate)
  const daysRemaining = Math.max(0, diffDaysBetweenKeys(todayKey, interviewKey))

  return {
    planId: plan._id,
    goalId: plan.goalId,
    version: plan.version,
    today: todayKey,
    overallCompletion,
    expectedCompletion,
    progressGap,
    progressStatus,
    totalDays: days.length,
    completedDays,
    missedDays,
    consecutiveMissedDays,
    daysRemaining,
    totalPlannedMinutes: calculatePlannedMinutes(allTasks),
    totalActualMinutes: calculateActualMinutes(allTasks),
    taskCounts,
    deviationDetected: severity !== 'NONE',
    severity,
    recommendedAction,
  }
}

module.exports = {
  updateTaskProgress,
  getDayProgress,
  getPlanProgress,
  getDayDeviation,
  getPlanDeviation,
}
