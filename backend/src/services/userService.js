const User = require('../models/User')
const AppError = require('../utils/AppError')
const isValidObjectId = require('../utils/isValidObjectId')

async function createUser({ name, email }) {
  const existing = await User.findOne({ email: email.trim().toLowerCase() })
  if (existing) {
    throw new AppError('A user with this email already exists', 409)
  }

  const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase() })
  return user
}

async function getUserById(id) {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid user id', 400)
  }

  const user = await User.findById(id)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  return user
}

async function updateUser(id, body = {}) {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid user id', 400)
  }

  // Only profile fields can be changed here - never passwordHash, etc.
  const updates = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.email !== undefined) updates.email = body.email

  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) {
    throw new AppError('name cannot be empty', 400)
  }

  if (updates.email) {
    if (typeof updates.email !== 'string') {
      throw new AppError('a valid email is required', 400)
    }
    const existing = await User.findOne({ email: updates.email.trim().toLowerCase(), _id: { $ne: id } })
    if (existing) {
      throw new AppError('A user with this email already exists', 409)
    }
    updates.email = updates.email.trim().toLowerCase()
  }

  if (updates.name) {
    updates.name = updates.name.trim()
  }

  const user = await User.findById(id)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  Object.assign(user, updates)
  await user.save()

  return user
}

async function deleteUser(id) {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid user id', 400)
  }

  const user = await User.findByIdAndDelete(id)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  return user
}

module.exports = { createUser, getUserById, updateUser, deleteUser }
