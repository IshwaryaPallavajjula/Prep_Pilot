const goalService = require('../services/goalService')
const asyncHandler = require('../utils/asyncHandler')
const { validateGoalInput } = require('../utils/validators')

const createGoal = asyncHandler(async (req, res) => {
  // The owner is always the authenticated user - a userId in the body is ignored.
  const body = { ...req.body, userId: req.userId }

  validateGoalInput(body)
  const goal = await goalService.createGoal(body, { today: req.clientToday })

  res.status(201).json({
    success: true,
    message: 'Goal created successfully',
    data: goal,
  })
})

const getGoalsByUser = asyncHandler(async (req, res) => {
  const goals = await goalService.getGoalsByUser(req.params.userId)

  res.status(200).json({
    success: true,
    message: 'Goals fetched successfully',
    data: goals,
  })
})

const getGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.getGoalById(req.params.id)

  res.status(200).json({
    success: true,
    message: 'Goal fetched successfully',
    data: goal,
  })
})

const updateGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.updateGoal(req.params.id, req.body, { today: req.clientToday })

  res.status(200).json({
    success: true,
    message: 'Goal updated successfully',
    data: goal,
  })
})

const deleteGoal = asyncHandler(async (req, res) => {
  await goalService.deleteGoal(req.params.id)

  res.status(200).json({
    success: true,
    message: 'Goal deleted successfully',
    data: null,
  })
})

module.exports = { createGoal, getGoalsByUser, getGoal, updateGoal, deleteGoal }
