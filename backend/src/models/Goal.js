const mongoose = require('mongoose')

// The onboarding UI offers Beginner / Comfortable / Confident / Strong.
// Intermediate / Advanced are kept so goals created earlier stay valid.
const SKILL_LEVELS = ['Beginner', 'Comfortable', 'Intermediate', 'Confident', 'Advanced', 'Strong']

const skillAssessmentSchema = new mongoose.Schema(
  {
    dsa: { type: String, enum: SKILL_LEVELS, default: 'Beginner' },
    csFundamentals: { type: String, enum: SKILL_LEVELS, default: 'Beginner' },
    systemDesign: { type: String, enum: SKILL_LEVELS, default: 'Beginner' },
  },
  { _id: false }
)

const preparationPreferencesSchema = new mongoose.Schema(
  {
    difficultyPreference: { type: String, trim: true, default: 'Medium' },
    sessionStyle: { type: String, trim: true, default: 'Focused' },
    mockInterviews: { type: Boolean, default: true },
    weekendIntensity: { type: String, trim: true, default: 'Normal' },
  },
  { _id: false }
)

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    targetRole: {
      type: String,
      required: [true, 'targetRole is required'],
      enum: {
        values: ['SDE-1', 'SDE-2'],
        message: 'targetRole must be either SDE-1 or SDE-2',
      },
    },
    targetCompanies: {
      type: [String],
      default: [],
    },
    interviewDate: {
      type: Date,
      required: [true, 'interviewDate is required'],
    },
    dailyStudyHours: {
      type: Number,
      required: [true, 'dailyStudyHours is required'],
      min: [0.1, 'dailyStudyHours must be greater than 0'],
    },
    studyDays: {
      type: [String],
      default: [],
    },
    preferredStudyTime: {
      type: String,
      trim: true,
      default: '',
    },
    skillAssessment: {
      type: skillAssessmentSchema,
      required: [true, 'skillAssessment is required'],
      default: () => ({}),
    },
    preparationPreferences: {
      type: preparationPreferencesSchema,
      default: () => ({}),
    },
    // Optional per-topic self assessment from onboarding, e.g. { Arrays: 'Confident' }
    topicAssessment: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Goal', goalSchema)
