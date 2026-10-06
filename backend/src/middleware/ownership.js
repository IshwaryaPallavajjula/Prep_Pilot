const Plan = require('../models/Plan')
const Goal = require('../models/Goal')
const MockInterview = require('../models/MockInterview')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const isValidObjectId = require('../utils/isValidObjectId')

function readValue(req, from, key) {
  return req[from]?.[key]
}

// Ownership guards. A resource that belongs to someone else is reported as
// "not found" (404) so the API never confirms that another user's data exists.

function requirePlanOwner(from = 'params', key = 'planId') {
  return asyncHandler(async (req, res, next) => {
    const id = readValue(req, from, key)

    if (!id || !isValidObjectId(id)) {
      throw new AppError('Invalid plan id', 400)
    }

    const plan = await Plan.findOne({ _id: id, userId: req.userId }).select('_id')

    if (!plan) {
      throw new AppError('Plan not found', 404)
    }

    next()
  })
}

function requireGoalOwner(from = 'params', key = 'id') {
  return asyncHandler(async (req, res, next) => {
    const id = readValue(req, from, key)

    if (!id || !isValidObjectId(id)) {
      throw new AppError('Invalid goal id', 400)
    }

    const goal = await Goal.findOne({ _id: id, userId: req.userId }).select('_id')

    if (!goal) {
      throw new AppError('Goal not found', 404)
    }

    next()
  })
}

function requireInterviewOwner(from = 'params', key = 'interviewId') {
  return asyncHandler(async (req, res, next) => {
    const id = readValue(req, from, key)

    if (!id || !isValidObjectId(id)) {
      throw new AppError('Invalid interview id', 400)
    }

    const interview = await MockInterview.findOne({ _id: id, userId: req.userId }).select('_id')

    if (!interview) {
      throw new AppError('Mock interview not found', 404)
    }

    next()
  })
}

// For routes shaped like /user/:userId - only your own id (or "me") is allowed.
function requireSelfParam(key = 'userId') {
  return (req, res, next) => {
    const value = req.params[key]

    if (value === 'me') {
      req.params[key] = req.userId
      return next()
    }

    if (value !== req.userId) {
      return next(new AppError('You can only access your own data', 403))
    }

    next()
  }
}

module.exports = {
  requirePlanOwner,
  requireGoalOwner,
  requireInterviewOwner,
  requireSelfParam,
}
