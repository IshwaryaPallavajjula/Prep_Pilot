const planService = require('../services/planService')
const asyncHandler = require('../utils/asyncHandler')
const { validatePlanInput, validateTaskUpdateInput } = require('../utils/validators')
const { parseDateOnly } = require('../utils/dates')

const createPlan = asyncHandler(async (req, res) => {
  // The owner is always the authenticated user
  const body = { ...req.body, userId: req.userId }

  validatePlanInput(body)

  const payload = {
    ...body,
    startDate: parseDateOnly(body.startDate),
    interviewDate: parseDateOnly(body.interviewDate),
    days: body.days?.map((day) => ({ ...day, date: parseDateOnly(day.date) })),
  }

  const plan = await planService.createPlan(payload)

  res.status(201).json({
    success: true,
    message: 'Plan created successfully',
    data: plan,
  })
})

const getPlan = asyncHandler(async (req, res) => {
  const plan = await planService.getPlanById(req.params.id)

  res.status(200).json({
    success: true,
    message: 'Plan fetched successfully',
    data: plan,
  })
})

const getPlansByUser = asyncHandler(async (req, res) => {
  const plans = await planService.getPlansByUser(req.params.userId)

  res.status(200).json({
    success: true,
    message: 'Plans fetched successfully',
    data: plans,
  })
})

// The plan the signed-in user is currently following (null when none yet)
const getActivePlan = asyncHandler(async (req, res) => {
  const plan = await planService.getActivePlanForUser(req.userId)

  res.status(200).json({
    success: true,
    message: plan ? 'Active plan fetched successfully' : 'No active plan yet',
    data: plan,
  })
})

const getPlanVersions = asyncHandler(async (req, res) => {
  const versions = await planService.getPlanVersionSummaries(req.userId)

  res.status(200).json({
    success: true,
    message: 'Plan versions fetched successfully',
    data: versions,
  })
})

const getTodayFromPlan = asyncHandler(async (req, res) => {
  const today = await planService.getTodayFromPlan(req.params.id, req.clientToday)

  res.status(200).json({
    success: true,
    message: "Today's plan fetched successfully",
    data: today,
  })
})

const updatePlan = asyncHandler(async (req, res) => {
  const plan = await planService.updatePlan(req.params.id, req.body)

  res.status(200).json({
    success: true,
    message: 'Plan updated successfully',
    data: plan,
  })
})

const updateTask = asyncHandler(async (req, res) => {
  validateTaskUpdateInput(req.body)
  const { plan, task } = await planService.updateTaskInPlan(req.params.id, req.params.taskId, req.body)

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: { plan, task },
  })
})

module.exports = {
  createPlan,
  getPlan,
  getPlansByUser,
  getActivePlan,
  getPlanVersions,
  getTodayFromPlan,
  updatePlan,
  updateTask,
}
