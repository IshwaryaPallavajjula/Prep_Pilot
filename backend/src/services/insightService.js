const Plan = require('../models/Plan')
const AppError = require('../utils/AppError')
const isValidObjectId = require('../utils/isValidObjectId')

const TASK_STATUS_WEIGHT = {
  DONE: 100,
  PARTIAL: 50,
  SKIPPED: 0,
  PENDING: 0,
}

function calculateOverallCompletion(plan) {
  const tasks = plan.days.flatMap((day) => day.tasks || [])

  if (!tasks.length) return 0

  const total = tasks.reduce(
    (sum, task) =>
      sum + (TASK_STATUS_WEIGHT[task.status] ?? 0),
    0
  )

  return Math.round(total / tasks.length)
}

function analyzeTopics(plan) {
  const topicMap = {}

  for (const day of plan.days) {
    const topic = day.focus || 'General'

    if (!topicMap[topic]) {
      topicMap[topic] = {
        topic,
        totalTasks: 0,
        completedTasks: 0,
        partialTasks: 0,
        pendingTasks: 0,
        skippedTasks: 0,
        plannedMinutes: 0,
        actualMinutes: 0,
      }
    }

    for (const task of day.tasks || []) {
      const area = topicMap[topic]

      area.totalTasks += 1
      area.plannedMinutes += task.estimatedMinutes || 0
      area.actualMinutes += task.timeSpentMinutes || 0

      if (task.status === 'DONE') {
        area.completedTasks += 1
      } else if (task.status === 'PARTIAL') {
        area.partialTasks += 1
      } else if (task.status === 'SKIPPED') {
        area.skippedTasks += 1
      } else {
        area.pendingTasks += 1
      }
    }
  }

  return Object.values(topicMap).map((area) => {
    const completionPercentage = area.totalTasks
      ? Math.round(
          (
            area.completedTasks * 100 +
            area.partialTasks * 50
          ) / area.totalTasks
        )
      : 0

    let weaknessScore = 0

    if (completionPercentage < 50) {
      weaknessScore += 5
    } else if (completionPercentage < 75) {
      weaknessScore += 3
    }

    if (area.pendingTasks > 0) {
      weaknessScore += 2
    }

    if (area.skippedTasks > 0) {
      weaknessScore += 2
    }

    return {
      ...area,
      completionPercentage,
      weaknessScore,
    }
  })
}

function determineStatus(completionPercentage, weakestArea) {
  if (!weakestArea) {
    return 'ON_TRACK'
  }

  if (
    completionPercentage < 30 ||
    weakestArea.weaknessScore >= 7
  ) {
    return 'AT_RISK'
  }

  if (
    completionPercentage < 70 ||
    weakestArea.weaknessScore >= 5
  ) {
    return 'NEEDS_ATTENTION'
  }

  return 'ON_TRACK'
}

function getNextAction(weakestArea) {
  if (!weakestArea) {
    return {
      action: 'CONTINUE',
      type: 'REVISION',
    }
  }

  if (weakestArea.pendingTasks > 0) {
    return {
      action: 'COMPLETE_PENDING_TASK',
      type: 'PRACTICE',
    }
  }

  if (weakestArea.partialTasks > 0) {
    return {
      action: 'FINISH_PARTIAL_TASK',
      type: 'PRACTICE',
    }
  }

  return {
    action: 'REVISE_WEAK_AREA',
    type: 'REVISION',
  }
}

async function getPlanInsights(planId) {
  if (!isValidObjectId(planId)) {
    throw new AppError('Invalid plan id', 400)
  }

  const plan = await Plan.findById(planId)

  if (!plan) {
    throw new AppError('Plan not found', 404)
  }

  const completionPercentage =
    calculateOverallCompletion(plan)

  const areas = analyzeTopics(plan)

  const sortedAreas = [...areas].sort(
    (a, b) => b.weaknessScore - a.weaknessScore
  )

  const weakestArea = sortedAreas[0] || null

  const status = determineStatus(
    completionPercentage,
    weakestArea
  )

  const nextAction = getNextAction(weakestArea)

  const recommendedMinutes =
    weakestArea?.pendingTasks > 0
      ? Math.min(
          Math.max(
            weakestArea.plannedMinutes -
              weakestArea.actualMinutes,
            30
          ),
          120
        )
      : 30

  let reason =
    'Your preparation is progressing according to the current plan.'

  if (weakestArea) {
    if (weakestArea.completionPercentage === 0) {
      reason = `${weakestArea.topic} has not been started yet and contains pending work.`
    } else if (weakestArea.completionPercentage < 50) {
      reason = `${weakestArea.topic} has low completion and should receive additional attention.`
    } else if (weakestArea.partialTasks > 0) {
      reason = `${weakestArea.topic} contains partially completed tasks that should be finished.`
    }
  }

  return {
    planId: plan._id,
    goalId: plan.goalId,

    status,

    completionPercentage,

    totalDays: plan.days.length,

    areas,

    weakestArea: weakestArea
      ? {
          topic: weakestArea.topic,
          completionPercentage:
            weakestArea.completionPercentage,
          weaknessScore:
            weakestArea.weaknessScore,
          pendingTasks:
            weakestArea.pendingTasks,
          partialTasks:
            weakestArea.partialTasks,
        }
      : null,

    recommendation: {
      action: nextAction.action,
      type: nextAction.type,
      focusArea: weakestArea?.topic || 'General Revision',
      suggestedMinutes: recommendedMinutes,
      reason,
    },

    shouldAdaptPlan:
      status === 'AT_RISK' ||
      status === 'NEEDS_ATTENTION',
  }
}

module.exports = {
  getPlanInsights,
  calculateOverallCompletion,
  analyzeTopics,
}