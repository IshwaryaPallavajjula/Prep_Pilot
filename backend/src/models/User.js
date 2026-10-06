const mongoose = require('mongoose')

const preferencesSchema = new mongoose.Schema(
  {
    theme: { type: String, enum: ['Light', 'Dark', 'System'], default: 'System' },
    notifications: {
      dailyReminder: { type: Boolean, default: true },
      weeklyReview: { type: Boolean, default: true },
      planAdjustments: { type: Boolean, default: true },
    },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    // bcrypt hash - never selected by default and never serialized.
    passwordHash: {
      type: String,
      select: false,
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash
        delete ret.__v
        return ret
      },
    },
  }
)

module.exports = mongoose.model('User', userSchema)
