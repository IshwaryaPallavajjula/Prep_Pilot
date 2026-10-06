const Goal = require('../models/Goal')
const User = require('../models/User')
const AppError = require('../utils/AppError')
const isValidObjectId = require('../utils/isValidObjectId')
const { parseDateOnly } = require('../utils/dates')

const EDITABLE_GOAL_FIELDS = [
  'targetRole',
  'targetCompanies',
  'interviewDate',
  'dailyStudyHours',
  'studyDays',
  'preferredStudyTime',
  'skillAssessment',
  'preparationPreferences',
  'topicAssessment',
  'status',
]

function assertInterviewDateNotPast(interviewDate, today) {
  const key = interviewDate.toISOString().slice(0, 10)

  if (today && key < today) {
    throw new AppError('Interview date must be today or later', 400)
  }
}

async function createGoal(rawPayload, { today } = {}) {
  const payload = { ...rawPayload }

  if (!isValidObjectId(payload.userId)) {
    throw new AppError('Invalid userId', 400)
  }

  // Calendar day stored as midnight UTC (see utils/dates.js)
  payload.interviewDate = parseDateOnly(payload.interviewDate)

  if (!payload.interviewDate) {
    throw new AppError('interviewDate must be a valid date', 400)
  }

  assertInterviewDateNotPast(payload.interviewDate, today)

  const user = await User.findById(payload.userId)
  if (!user) {
    throw new AppError('User not found for the provided userId', 404)
  }

  const goal = await Goal.create(payload)
  return goal
}

async function getGoalsByUser(userId) {
  if (!isValidObjectId(userId)) {
    throw new AppError('Invalid userId', 400)
  }

  return Goal.find({ userId }).sort({ createdAt: -1 })
}

async function getGoalById(id) {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid goal id', 400)
  }

  const goal = await Goal.findById(id)
  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

  return goal
}

async function updateGoal(id, body = {}, { today } = {}) {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid goal id', 400)
  }

  // Whitelist: userId and other internals can never be changed through here.
  const updates = {}
  for (const field of EDITABLE_GOAL_FIELDS) {
    if (body[field] !== undefined) updates[field] = body[field]
  }

  if (updates.interviewDate !== undefined) {
    updates.interviewDate = parseDateOnly(updates.interviewDate)

    if (!updates.interviewDate) {
      throw new AppError('interviewDate must be a valid date', 400)
    }

    assertInterviewDateNotPast(updates.interviewDate, today)
  }

  if (updates.dailyStudyHours !== undefined && !(Number(updates.dailyStudyHours) > 0)) {
    throw new AppError('dailyStudyHours must be greater than 0', 400)
  }

  const goal = await Goal.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

  return goal
}

async function deleteGoal(id) {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid goal id', 400)
  }

  const goal = await Goal.findByIdAndDelete(id)
  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

  return goal
}

module.exports = { createGoal, getGoalsByUser, getGoalById, updateGoal, deleteGoal }
