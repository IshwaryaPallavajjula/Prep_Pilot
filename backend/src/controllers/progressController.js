const progressService = require('../services/progressService')
const asyncHandler = require('../utils/asyncHandler')

const ok = (res, message, data) => res.status(200).json({ success: true, message, data })

const updateTaskProgress = asyncHandler(async (req, res) => {
  const { planId, taskId, status, timeSpentMinutes } = req.body

  const result = await progressService.updateTaskProgress({
    planId,
    taskId,
    status,
    timeSpentMinutes,
  })

  ok(res, 'Task progress updated successfully', result)
})

const getDayProgress = asyncHandler(async (req, res) => {
  const { planId, dayNumber } = req.params

  ok(res, 'Day progress fetched successfully', await progressService.getDayProgress(planId, dayNumber))
})

const getPlanProgress = asyncHandler(async (req, res) => {
  ok(res, 'Plan progress fetched successfully', await progressService.getPlanProgress(req.params.planId))
})

const getDayDeviation = asyncHandler(async (req, res) => {
  const { planId, dayNumber } = req.params

  ok(
    res,
    'Day deviation analysis completed successfully',
    await progressService.getDayDeviation(planId, dayNumber, { today: req.clientToday })
  )
})

const getPlanDeviation = asyncHandler(async (req, res) => {
  ok(
    res,
    'Plan deviation analysis completed successfully',
    await progressService.getPlanDeviation(req.params.planId, { today: req.clientToday })
  )
})

module.exports = {
  updateTaskProgress,
  getDayProgress,
  getPlanProgress,
  getDayDeviation,
  getPlanDeviation,
}
