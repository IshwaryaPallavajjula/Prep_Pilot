// Task statuses are the backend's own values (Plan.days[].tasks[].status).
export const TASK_STATUS = {
  PENDING: 'PENDING',
  DONE: 'DONE',
  PARTIAL: 'PARTIAL',
  SKIPPED: 'SKIPPED',
}

export const TASK_STATUS_LABEL = {
  [TASK_STATUS.PENDING]: 'Not started',
  [TASK_STATUS.DONE]: 'Completed',
  [TASK_STATUS.PARTIAL]: 'Partially done',
  [TASK_STATUS.SKIPPED]: 'Skipped',
}

export const STATUS_COLOR = {
  [TASK_STATUS.PENDING]: 'bg-slate-100 text-slate-500',
  [TASK_STATUS.DONE]: 'bg-emerald-100 text-emerald-700',
  [TASK_STATUS.PARTIAL]: 'bg-amber-100 text-amber-600',
  [TASK_STATUS.SKIPPED]: 'bg-red-100 text-red-600',
}

// Status of a whole plan day (derived from its tasks)
export const DAY_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  PARTIAL: 'PARTIAL',
  SKIPPED: 'SKIPPED',
}

export const DAY_STATUS_LABEL = {
  [DAY_STATUS.NOT_STARTED]: 'Not started',
  [DAY_STATUS.IN_PROGRESS]: 'In progress',
  [DAY_STATUS.COMPLETED]: 'Completed',
  [DAY_STATUS.PARTIAL]: 'Partially done',
  [DAY_STATUS.SKIPPED]: 'Skipped',
}

export const DAY_STATUS_COLOR = {
  [DAY_STATUS.NOT_STARTED]: 'bg-slate-100 text-slate-500',
  [DAY_STATUS.IN_PROGRESS]: 'bg-runway-100 text-runway-700',
  [DAY_STATUS.COMPLETED]: 'bg-emerald-100 text-emerald-700',
  [DAY_STATUS.PARTIAL]: 'bg-amber-100 text-amber-600',
  [DAY_STATUS.SKIPPED]: 'bg-red-100 text-red-600',
}

// Backend task types -> the categories the UI groups by
export const TASK_TYPE_LABEL = {
  LEARN: 'Learn',
  PRACTICE: 'Practice',
  REVISION: 'Revision',
  MOCK_INTERVIEW: 'Mock interview',
  CS_FUNDAMENTALS: 'CS fundamentals',
  SYSTEM_DESIGN: 'System design',
}

export const ROLES = ['SDE-1', 'SDE-2']

export const COMPANIES = ['Amazon', 'Microsoft', 'Google', 'Meta', 'Flipkart', 'Atlassian', 'Other']

export const AVAILABILITY_OPTIONS = ['1 hour', '2 hours', '3 hours', '4 hours', '5+ hours']

// "3 hours" -> 3, "5+ hours" -> 5
export function availabilityToHours(option) {
  const hours = Number.parseFloat(option)
  return Number.isNaN(hours) ? 2 : hours
}

// 3 -> "3 hours", 5 or more -> "5+ hours", 1 -> "1 hour"
export function hoursToAvailability(hours) {
  const n = Number(hours)
  if (n >= 5) return '5+ hours'
  const match = AVAILABILITY_OPTIONS.find((option) => Number.parseFloat(option) === n)
  return match || `${n} hours`
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const SKILL_LEVELS = ['Beginner', 'Comfortable', 'Confident', 'Strong']

export const TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Stacks & Queues',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'OOP',
  'System Design',
]

export const DIFFICULTY_PREFERENCES = ['Easy first', 'Balanced', 'Push hard']

export const SESSION_STYLES = ['Focused single topic', 'Mixed practice', 'Timed mock style']

export const PLAN_CATEGORIES = ['All', 'DSA', 'CS', 'System Design', 'Mock', 'Revision']

export const PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
}

export const PRIORITY_COLOR = {
  LOW: 'text-signal-slate bg-slate-100',
  MEDIUM: 'text-signal-amber bg-amber-50',
  HIGH: 'text-signal-red bg-red-50',
}

// Legacy key used by the old mock-auth build. Cleared on startup.
export const LEGACY_STORAGE_KEY = 'preppilot.app.state.v1'
export const SESSION_STORAGE_KEY = 'preppilot.session.v2'
