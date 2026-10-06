const mongoose = require('mongoose')

const TASK_STATUS = ['PENDING', 'DONE', 'SKIPPED', 'PARTIAL']
const TASK_TYPES = ['LEARN', 'PRACTICE', 'REVISION', 'MOCK_INTERVIEW', 'CS_FUNDAMENTALS', 'SYSTEM_DESIGN']
const PLAN_STATUS = ['ACTIVE', 'ARCHIVED']

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: [true, 'taskId is required'],
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: {
        values: TASK_TYPES,
        message: `type must be one of: ${TASK_TYPES.join(', ')}`,
      },
      required: [true, 'Task type is required'],
    },
    estimatedMinutes: {
      type: Number,
      required: [true, 'estimatedMinutes is required'],
      min: [1, 'estimatedMinutes must be greater than 0'],
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUS,
        message: `status must be one of: ${TASK_STATUS.join(', ')}`,
      },
      default: 'PENDING',
    },
    timeSpentMinutes: {
      type: Number,
      default: 0,
      min: [0, 'timeSpentMinutes cannot be negative'],
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
)

const daySchema = new mongoose.Schema(
  {
    dayNumber: {
      type: Number,
      required: [true, 'dayNumber is required'],
      min: [1, 'dayNumber must be at least 1'],
    },
    date: {
      type: Date,
      required: [true, 'date is required for each day'],
    },
    focus: {
      type: String,
      trim: true,
      default: '',
    },
    tasks: {
      type: [taskSchema],
      default: [],
    },
    estimatedTime: {
      type: Number,
      default: 0,
      min: [0, 'estimatedTime cannot be negative'],
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
)

// Describes why a plan version exists / what the AI last decided about it.
const adaptationSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['INITIAL', 'CONTINUE', 'ADJUST', 'REPLAN'],
      required: true,
    },
    focusArea: { type: String, default: '' },
    suggestedMinutes: { type: Number, default: 0 },
    reason: { type: String, default: '' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
    recommendations: { type: [String], default: [] },
    planUpdated: { type: Boolean, default: false },
    previousVersion: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const planSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: [true, 'goalId is required'],
    },
    title: {
      type: String,
      trim: true,
      default: 'Preparation Plan',
    },
    startDate: {
      type: Date,
      required: [true, 'startDate is required'],
    },
    interviewDate: {
      type: Date,
      required: [true, 'interviewDate is required'],
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: {
        values: PLAN_STATUS,
        message: `status must be one of: ${PLAN_STATUS.join(', ')}`,
      },
      default: 'ACTIVE',
    },
    days: {
      type: [daySchema],
      default: [],
    },
    // How this version came to exist (initial generation or an adaptive replan).
    adaptation: {
      type: adaptationSchema,
      default: null,
    },
    // The most recent AI progress analysis run against this version.
    lastAnalysis: {
      type: adaptationSchema,
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Plan', planSchema)
