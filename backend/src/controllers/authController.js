const authService = require('../services/authService')
const asyncHandler = require('../utils/asyncHandler')

const signup = asyncHandler(async (req, res) => {
  const data = await authService.signup(req.body || {})

  res.status(201).json({ success: true, message: 'Account created successfully', data })
})

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body || {})

  res.status(200).json({ success: true, message: 'Logged in successfully', data })
})

const me = asyncHandler(async (req, res) => {
  const data = await authService.getCurrentSession(req.user)

  res.status(200).json({ success: true, message: 'Current user fetched successfully', data })
})

const updateMe = asyncHandler(async (req, res) => {
  const data = await authService.updateProfile(req.user, req.body || {})

  res.status(200).json({ success: true, message: 'Profile updated successfully', data })
})

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.userId, req.body || {})

  res.status(200).json({ success: true, message: 'Password changed successfully', data: null })
})

// JWTs are stateless: logging out is the client discarding its token.
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully', data: null })
})

const deleteMe = asyncHandler(async (req, res) => {
  await authService.deleteAccount(req.userId, req.body || {})

  res.status(200).json({ success: true, message: 'Account deleted successfully', data: null })
})

module.exports = { signup, login, me, updateMe, changePassword, logout, deleteMe }
