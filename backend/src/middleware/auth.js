const jwt = require('jsonwebtoken')
const User = require('../models/User')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const isValidObjectId = require('../utils/isValidObjectId')
const { getJwtSecret } = require('../config/auth')

// Verifies the Bearer token, loads the user, and exposes it as req.user.
// Every non-public route sits behind this, so a request can only ever act as
// the account that owns the token.
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.get('Authorization') || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Authentication required. Please log in.', 401)
  }

  let payload

  try {
    payload = jwt.verify(token, getJwtSecret())
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid session. Please log in again.'
    throw new AppError(message, 401)
  }

  if (!payload?.sub || !isValidObjectId(payload.sub)) {
    throw new AppError('Invalid session. Please log in again.', 401)
  }

  const user = await User.findById(payload.sub)

  if (!user) {
    throw new AppError('Account no longer exists. Please sign up again.', 401)
  }

  req.user = user
  req.userId = user._id.toString()
  next()
})

module.exports = requireAuth
