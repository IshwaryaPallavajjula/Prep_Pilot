const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const Goal = require('../models/Goal')
const Plan = require('../models/Plan')
const MockInterview = require('../models/MockInterview')
const AppError = require('../utils/AppError')
const { getJwtSecret, JWT_EXPIRES_IN, BCRYPT_ROUNDS } = require('../config/auth')

const EMAIL_RE = /^\S+@\S+\.\S+$/
const MIN_PASSWORD_LENGTH = 8

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  })
}

// "Onboarding complete" = the account has at least one plan.
async function getOnboardingState(userId) {
  const activePlan = await Plan.findOne({ userId, status: 'ACTIVE' })
    .sort({ version: -1 })
    .select('_id')

  if (activePlan) {
    return { onboardingComplete: true, activePlanId: activePlan._id }
  }

  const anyPlan = await Plan.exists({ userId })

  return { onboardingComplete: Boolean(anyPlan), activePlanId: null }
}

async function buildSession(user, { withToken = true } = {}) {
  const state = await getOnboardingState(user._id)

  return {
    user: user.toJSON(),
    ...(withToken ? { token: signToken(user) } : {}),
    onboardingComplete: state.onboardingComplete,
    activePlanId: state.activePlanId,
  }
}

async function signup({ name, email, password }) {
  const errors = []
  const cleanName = typeof name === 'string' ? name.trim() : ''
  const cleanEmail = normalizeEmail(email)

  if (!cleanName) errors.push('name is required')
  if (!EMAIL_RE.test(cleanEmail)) errors.push('a valid email is required')
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  }

  if (errors.length) {
    throw new AppError(errors.join(', '), 400)
  }

  const existing = await User.findOne({ email: cleanEmail })

  if (existing) {
    throw new AppError('An account with this email already exists. Try logging in instead.', 409)
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

  let user

  try {
    user = await User.create({ name: cleanName, email: cleanEmail, passwordHash })
  } catch (error) {
    // Two simultaneous signups with the same email
    if (error?.code === 11000) {
      throw new AppError('An account with this email already exists. Try logging in instead.', 409)
    }
    throw error
  }

  return buildSession(user)
}

// A real bcrypt hash used to keep response time similar for unknown emails.
const DUMMY_HASH = bcrypt.hashSync('preppilot-dummy-password', BCRYPT_ROUNDS)

async function login({ email, password }) {
  const cleanEmail = normalizeEmail(email)

  if (!cleanEmail || typeof password !== 'string' || !password) {
    throw new AppError('Email and password are required', 400)
  }

  const user = await User.findOne({ email: cleanEmail }).select('+passwordHash')
  const passwordOk = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH)

  if (!user || !user.passwordHash || !passwordOk) {
    throw new AppError('Incorrect email or password', 401)
  }

  return buildSession(user)
}

async function getCurrentSession(user) {
  return buildSession(user, { withToken: false })
}

async function updateProfile(user, updates = {}) {
  if (updates.name !== undefined) {
    const name = typeof updates.name === 'string' ? updates.name.trim() : ''
    if (!name) throw new AppError('Name cannot be empty', 400)
    user.name = name
  }

  if (updates.email !== undefined) {
    const email = normalizeEmail(updates.email)
    if (!EMAIL_RE.test(email)) throw new AppError('A valid email is required', 400)

    if (email !== user.email) {
      const taken = await User.findOne({ email, _id: { $ne: user._id } }).select('_id')
      if (taken) throw new AppError('Another account already uses this email', 409)
      user.email = email
    }
  }

  if (updates.preferences && typeof updates.preferences === 'object') {
    const { theme, notifications } = updates.preferences

    if (theme !== undefined) {
      if (!['Light', 'Dark', 'System'].includes(theme)) {
        throw new AppError('theme must be Light, Dark or System', 400)
      }
      user.preferences.theme = theme
    }

    if (notifications && typeof notifications === 'object') {
      for (const key of ['dailyReminder', 'weeklyReview', 'planAdjustments']) {
        if (notifications[key] !== undefined) {
          user.preferences.notifications[key] = Boolean(notifications[key])
        }
      }
    }
  }

  try {
    await user.save()
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError('Another account already uses this email', 409)
    }
    throw error
  }

  return buildSession(user, { withToken: false })
}

async function changePassword(userId, { currentPassword, newPassword }) {
  if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400)
  }

  const user = await User.findById(userId).select('+passwordHash')
  const ok = user?.passwordHash && (await bcrypt.compare(currentPassword || '', user.passwordHash))

  if (!ok) {
    throw new AppError('Current password is incorrect', 400)
  }

  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
  await user.save()
}

// Permanently removes the account and everything that belongs to it.
async function deleteAccount(userId, { password }) {
  const user = await User.findById(userId).select('+passwordHash')
  const ok = user?.passwordHash && (await bcrypt.compare(password || '', user.passwordHash))

  if (!ok) {
    throw new AppError('Password is incorrect', 400)
  }

  await Promise.all([
    MockInterview.deleteMany({ userId }),
    Plan.deleteMany({ userId }),
    Goal.deleteMany({ userId }),
  ])
  await User.deleteOne({ _id: userId })
}

module.exports = {
  signup,
  login,
  getCurrentSession,
  updateProfile,
  changePassword,
  deleteAccount,
}
