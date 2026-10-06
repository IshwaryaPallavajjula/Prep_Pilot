const Plan = require('../models/Plan')
const AppError = require('../utils/AppError')

async function getWeakAreas(planId) {
  const plan = await Plan.findById(planId)

  if (!plan) {
    throw new AppError('Plan not found', 404)
  }

  const topicStats = {}

  for (const day of plan.days) {
    const topic = day.focus || 'General'

    if (!topicStats[topic]) {
      topicStats[topic] = {
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

    const stats = topicStats[topic]

    for (const task of day.tasks) {
      stats.totalTasks += 1
      stats.plannedMinutes += task.estimatedMinutes || 0
      stats.actualMinutes += task.timeSpentMinutes || 0

      if (task.status === 'DONE') {
        stats.completedTasks += 1
      } else if (task.status === 'PARTIAL') {
        stats.partialTasks += 1
      } else if (task.status === 'PENDING') {
        stats.pendingTasks += 1
      } else if (task.status === 'SKIPPED') {
        stats.skippedTasks += 1
      }
    }
  }

  const areas = Object.values(topicStats).map((stats) => {
    const total = stats.totalTasks

    const completionPercentage =
      total > 0
        ? Math.round(
            (stats.completedTasks / total) * 100
          )
        : 0

    let weaknessScore = 0

    weaknessScore += stats.pendingTasks * 2
    weaknessScore += stats.partialTasks * 1.5
    weaknessScore += stats.skippedTasks * 3

    if (completionPercentage < 50) {
      weaknessScore += 3
    }

    return {
      ...stats,
      completionPercentage,
      weaknessScore: Math.round(weaknessScore * 10) / 10,
    }
  })

  areas.sort(
    (a, b) => b.weaknessScore - a.weaknessScore
  )

  return {
    planId: plan._id,
    totalAreas: areas.length,
    weakAreas: areas.filter(
      (area) => area.weaknessScore > 0
    ),
    areas,
  }
}

module.exports = {
  getWeakAreas,
}