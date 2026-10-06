const Plan = require('../models/Plan')
const User = require('../models/User')
const Goal = require('../models/Goal')
const AppError = require('../utils/AppError')
const isValidObjectId = require('../utils/isValidObjectId')
const { toDateKey, parseDateOnly, resolveToday } = require('../utils/dates')

const ALLOWED_TASK_TYPES = [
  'LEARN',
  'PRACTICE',
  'REVISION',
  'MOCK_INTERVIEW',
  'CS_FUNDAMENTALS',
  'SYSTEM_DESIGN',
]

// Completion weights for different task statuses
const TASK_STATUS_WEIGHT = {
  DONE: 100,
  PARTIAL: 50,
  SKIPPED: 0,
  PENDING: 0,
}

// Calculate completion percentage for a day
function calculateDayCompletionPercentage(tasks) {
  if (!tasks.length) return 0

  const totalWeight = tasks.reduce(
    (sum, task) => sum + (TASK_STATUS_WEIGHT[task.status] ?? 0),
    0
  )

  return Math.round(totalWeight / tasks.length)
}

function sumEstimatedMinutes(tasks) {
  return tasks.reduce((total, task) => total + (task.estimatedMinutes || 0), 0)
}

// Create a new study plan
async function createPlan(payload) {
  if (!isValidObjectId(payload.userId)) {
    throw new AppError('Invalid userId', 400)
  }

  if (!isValidObjectId(payload.goalId)) {
    throw new AppError('Invalid goalId', 400)
  }

  const user = await User.findById(payload.userId)

  if (!user) {
    throw new AppError('User not found for the provided userId', 404)
  }

  // The goal must exist AND belong to the same user
  const goal = await Goal.findOne({ _id: payload.goalId, userId: payload.userId })

  if (!goal) {
    throw new AppError('Goal not found for the provided goalId', 404)
  }

  const plan = await Plan.create(payload)

  return plan
}

// Get a plan by ID
async function getPlanById(id) {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid plan id', 400)
  }

  const plan = await Plan.findById(id)

  if (!plan) {
    throw new AppError('Plan not found', 404)
  }

  return plan
}

// Get all plans belonging to a user
async function getPlansByUser(userId) {
  if (!isValidObjectId(userId)) {
    throw new AppError('Invalid userId', 400)
  }

  return Plan.find({ userId }).sort({ createdAt: -1 })
}

// The plan the user is currently following (newest ACTIVE version), or null.
async function getActivePlanForUser(userId) {
  if (!isValidObjectId(userId)) {
    throw new AppError('Invalid userId', 400)
  }

  return Plan.findOne({ userId, status: 'ACTIVE' }).sort({ version: -1, createdAt: -1 })
}

// Lightweight summary of every version of the user's current plan lineage.
async function getPlanVersionSummaries(userId) {
  const active = await getActivePlanForUser(userId)

  if (!active) return []

  const plans = await Plan.find({ userId, goalId: active.goalId }).sort({ version: 1 })

  return plans.map((plan) => {
    const tasks = plan.days.flatMap((day) => day.tasks || [])
    const weight = tasks.reduce((sum, task) => sum + (TASK_STATUS_WEIGHT[task.status] ?? 0), 0)

    return {
      _id: plan._id,
      version: plan.version,
      status: plan.status,
      title: plan.title,
      createdAt: plan.createdAt,
      startDate: plan.startDate,
      interviewDate: plan.interviewDate,
      totalDays: plan.days.length,
      totalTasks: tasks.length,
      plannedMinutes: sumEstimatedMinutes(tasks),
      actualMinutes: tasks.reduce((sum, task) => sum + (task.timeSpentMinutes || 0), 0),
      completionPercentage: tasks.length ? Math.round(weight / tasks.length) : 0,
      firstFocus: plan.days[0]?.focus || '',
      adaptation: plan.adaptation || null,
      lastAnalysis: plan.lastAnalysis || null,
    }
  })
}

// Get today's plan entry (today = the client's calendar day)
async function getTodayFromPlan(id, today) {
  const plan = await getPlanById(id)

  const todayKey = resolveToday(today)

  const todayEntry = plan.days.find((day) => toDateKey(day.date) === todayKey)

  if (!todayEntry) {
    throw new AppError('No plan day found for today', 404)
  }

  return todayEntry
}

// Update plan-level fields. Ownership fields can never be changed here.
async function updatePlan(id, body = {}) {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid plan id', 400)
  }

  const updates = { ...body }
  for (const forbidden of ['_id', 'userId', 'goalId', 'version', 'createdAt', 'updatedAt']) {
    delete updates[forbidden]
  }

  const plan = await Plan.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })

  if (!plan) {
    throw new AppError('Plan not found', 404)
  }

  return plan
}

// Update an individual task inside a plan
async function updateTaskInPlan(id, taskId, updates) {
  const plan = await getPlanById(id)

  let matchedTask = null

  for (const day of plan.days) {
    const task = day.tasks.find((t) => t.taskId === taskId)

    if (task) {
      if (updates.status !== undefined) {
        task.status = updates.status

        // Record completion time only when the task becomes DONE.
        if (updates.status === 'DONE') {
          task.completedAt = updates.completedAt !== undefined ? updates.completedAt : new Date()
        } else {
          task.completedAt = null
        }
      } else if (updates.completedAt !== undefined) {
        task.completedAt = updates.completedAt
      }

      if (updates.timeSpentMinutes !== undefined) {
        task.timeSpentMinutes = updates.timeSpentMinutes
      }

      day.completionPercentage = calculateDayCompletionPercentage(day.tasks)

      matchedTask = task

      break
    }
  }

  if (!matchedTask) {
    throw new AppError('Task not found in this plan', 404)
  }

  await plan.save()

  return {
    plan,
    task: matchedTask,
  }
}

// ---------------------------------------------
// GET LATEST PLAN VERSION
// ---------------------------------------------

async function getLatestPlanVersion(userId, goalId) {
  if (!isValidObjectId(userId)) {
    throw new AppError('Invalid userId', 400)
  }

  if (!isValidObjectId(goalId)) {
    throw new AppError('Invalid goalId', 400)
  }

  return Plan.findOne({ userId, goalId }).sort({ version: -1 })
}

// ---------------------------------------------
// TURN AN AI PLAN INTO PLAN DAYS (with real calendar dates)
//
// dateKeys[i] is the calendar day ("YYYY-MM-DD") of the (i+1)-th study day.
// Day numbers are re-sequenced 1..n and task ids are guaranteed unique.
// ---------------------------------------------

function buildPlanDays(aiPlan, dateKeys) {
  if (!dateKeys.length) {
    throw new AppError('There are no study days available before the interview date', 400)
  }

  const aiDays = [...aiPlan.days]
    .filter((day) => Array.isArray(day.tasks) && day.tasks.length > 0)
    .sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber))
    .slice(0, dateKeys.length)

  if (!aiDays.length) {
    throw new AppError('AI returned a plan without any tasks', 500)
  }

  const usedIds = new Set()

  return aiDays.map((day, dayIndex) => {
    const dayNumber = dayIndex + 1

    const tasks = day.tasks.map((task, taskIndex) => {
      let taskId = typeof task.taskId === 'string' && task.taskId.trim() ? task.taskId.trim() : ''

      // Progress lookups are by taskId, so every id in a plan must be unique.
      if (!taskId || usedIds.has(taskId)) {
        taskId = `D${dayNumber}-T${taskIndex + 1}`
      }
      while (usedIds.has(taskId)) {
        taskId = `${taskId}x`
      }
      usedIds.add(taskId)

      return {
        taskId,
        title: String(task.title).trim(),
        description: task.description ? String(task.description).trim() : '',
        type: task.type,
        estimatedMinutes: Math.max(1, Math.round(Number(task.estimatedMinutes))),
        status: 'PENDING',
        timeSpentMinutes: 0,
        completedAt: null,
      }
    })

    return {
      dayNumber,
      date: parseDateOnly(dateKeys[dayIndex]),
      focus: String(day.focus).trim(),
      tasks,
      estimatedTime: sumEstimatedMinutes(tasks),
      completionPercentage: 0,
    }
  })
}

// ---------------------------------------------
// CREATE NEW PLAN VERSION
// ---------------------------------------------

async function createPlanVersion({
  previousPlan,
  days,
  title,
  startDate,
  interviewDate,
  adaptation,
}) {
  if (!previousPlan) {
    throw new AppError('Previous plan is required', 400)
  }

  const nextVersion = (previousPlan.version || 1) + 1

  const newPlan = await Plan.create({
    userId: previousPlan.userId,
    goalId: previousPlan.goalId,
    title: title || previousPlan.title,
    startDate: startDate || previousPlan.startDate,
    interviewDate: interviewDate || previousPlan.interviewDate,
    version: nextVersion,
    status: 'ACTIVE',
    days,
    adaptation: adaptation
      ? { ...adaptation, previousVersion: previousPlan.version || 1, createdAt: new Date() }
      : null,
  })

  // Archive the previous plan version
  previousPlan.status = 'ARCHIVED'
  await previousPlan.save()

  return newPlan
}

// ---------------------------------------------
// ADJUST PENDING TASKS (explicit per-task edits; never touches finished work)
// ---------------------------------------------

async function adjustPendingTasks(planId, updates) {
  const plan = await getPlanById(planId)

  if (!Array.isArray(updates)) {
    throw new AppError('updates must be an array', 400)
  }

  for (const update of updates) {
    if (!update.taskId) {
      continue
    }

    for (const day of plan.days || []) {
      const task = (day.tasks || []).find((item) => item.taskId === update.taskId)

      if (!task) {
        continue
      }

      // Never modify tasks the user has already acted on
      if (task.status !== 'PENDING') {
        continue
      }

      if (update.title !== undefined) {
        task.title = update.title
      }

      if (update.description !== undefined) {
        task.description = update.description
      }

      if (update.estimatedMinutes !== undefined) {
        if (typeof update.estimatedMinutes !== 'number' || update.estimatedMinutes <= 0) {
          throw new AppError('estimatedMinutes must be a positive number', 400)
        }

        task.estimatedMinutes = update.estimatedMinutes
      }

      if (update.type !== undefined) {
        if (!ALLOWED_TASK_TYPES.includes(update.type)) {
          throw new AppError('Invalid task type', 400)
        }

        task.type = update.type
      }

      break
    }
  }

  for (const day of plan.days || []) {
    day.estimatedTime = sumEstimatedMinutes(day.tasks || [])
    day.completionPercentage = calculateDayCompletionPercentage(day.tasks || [])
  }

  await plan.save()

  return plan
}

// ---------------------------------------------
// APPLY AN AI "ADJUST" DECISION
//
// A small, real change to the plan: a catch-up session for the AI's focus area
// is added to the next day that has not finished yet (today if it is a study
// day, otherwise the next upcoming one). Completed work is never modified.
// ---------------------------------------------

async function applyAdjustment(planId, adaptation, today) {
  const plan = await getPlanById(planId)
  const todayKey = resolveToday(today)

  const target =
    plan.days.find((day) => toDateKey(day.date) >= todayKey) || plan.days[plan.days.length - 1]

  if (!target) {
    throw new AppError('This plan has no days to adjust', 400)
  }

  const minutes = Math.max(15, Math.min(120, Math.round(Number(adaptation.suggestedMinutes) || 30)))
  const focus = adaptation.focusArea || 'weak areas'
  const nextTaskId = `ADJ-${Date.now().toString(36)}`

  target.tasks.push({
    taskId: nextTaskId,
    title: `Catch-up: ${focus}`,
    description:
      adaptation.recommendations?.[0] ||
      adaptation.reason ||
      `Added by PrepPilot to close the gap in ${focus}.`,
    type: 'REVISION',
    estimatedMinutes: minutes,
    status: 'PENDING',
    timeSpentMinutes: 0,
    completedAt: null,
  })

  target.estimatedTime = sumEstimatedMinutes(target.tasks)
  target.completionPercentage = calculateDayCompletionPercentage(target.tasks)

  plan.lastAnalysis = { ...adaptation, planUpdated: true, createdAt: new Date() }

  await plan.save()

  return { plan, addedTaskId: nextTaskId, addedToDay: target.dayNumber }
}

// Remember the latest AI analysis (also used for CONTINUE, where nothing changes)
async function saveLastAnalysis(planId, adaptation, planUpdated = false) {
  const plan = await getPlanById(planId)

  plan.lastAnalysis = { ...adaptation, planUpdated, createdAt: new Date() }
  await plan.save()

  return plan
}

module.exports = {
  createPlan,
  getPlanById,
  getPlansByUser,
  getActivePlanForUser,
  getPlanVersionSummaries,
  getTodayFromPlan,
  updatePlan,
  updateTaskInPlan,
  getLatestPlanVersion,
  createPlanVersion,
  adjustPendingTasks,
  buildPlanDays,
  applyAdjustment,
  saveLastAnalysis,
}
