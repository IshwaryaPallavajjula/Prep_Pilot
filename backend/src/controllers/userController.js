const userService = require('../services/userService')
const asyncHandler = require('../utils/asyncHandler')
const { validateUserInput } = require('../utils/validators')

const createUser = asyncHandler(async (req, res) => {
  validateUserInput(req.body)
  const user = await userService.createUser(req.body)

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  })
})

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id)

  res.status(200).json({
    success: true,
    message: 'User fetched successfully',
    data: user,
  })
})

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body)

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  })
})

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id)

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: null,
  })
})

module.exports = { createUser, getUser, updateUser, deleteUser }
