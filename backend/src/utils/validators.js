const AppError = require('./AppError')

function validateUserInput({ name, email }) {
  const errors = []

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('name is required')
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.push('a valid email is required')
  }

  if (errors.length) {
    throw new AppError(errors.join(', '), 400)
  }
}

function validateGoalInput(body) {
  const errors = []
  const { userId, targetRole, interviewDate, dailyStudyHours, skillAssessment } = body

  if (!userId) {
    errors.push('userId is required')
  }

  if (!targetRole || !['SDE-1', 'SDE-2'].includes(targetRole)) {
    errors.push('targetRole must be SDE-1 or SDE-2')
  }

  if (!interviewDate || Number.isNaN(new Date(interviewDate).getTime())) {
    errors.push('interviewDate must be a valid date')
  }

  if (dailyStudyHours === undefined || dailyStudyHours === null || Number(dailyStudyHours) <= 0) {
    errors.push('dailyStudyHours must be greater than 0')
  }

  if (!skillAssessment || typeof skillAssessment !== 'object') {
    errors.push('skillAssessment is required')
  }

  if (errors.length) {
    throw new AppError(errors.join(', '), 400)
  }
}

const PLAN_TASK_STATUSES = ['PENDING', 'DONE', 'SKIPPED', 'PARTIAL']
const PLAN_TASK_TYPES = ['LEARN', 'PRACTICE', 'REVISION', 'MOCK_INTERVIEW', 'CS_FUNDAMENTALS', 'SYSTEM_DESIGN']

function validatePlanInput(body) {
  const errors = []
  const { userId, goalId, startDate, interviewDate, days } = body

  if (!userId) {
    errors.push('userId is required')
  }

  if (!goalId) {
    errors.push('goalId is required')
  }

  if (!startDate || Number.isNaN(new Date(startDate).getTime())) {
    errors.push('startDate must be a valid date')
  }

  if (!interviewDate || Number.isNaN(new Date(interviewDate).getTime())) {
    errors.push('interviewDate must be a valid date')
  }

  if (days !== undefined) {
    if (!Array.isArray(days)) {
      errors.push('days must be an array')
    } else {
      days.forEach((day, index) => {
        if (!day.dayNumber) {
          errors.push(`days[${index}].dayNumber is required`)
        }
        if (!day.date || Number.isNaN(new Date(day.date).getTime())) {
          errors.push(`days[${index}].date must be a valid date`)
        }
        if (day.tasks !== undefined && !Array.isArray(day.tasks)) {
          errors.push(`days[${index}].tasks must be an array`)
        } else if (Array.isArray(day.tasks)) {
          day.tasks.forEach((task, taskIndex) => {
            if (!task.taskId) {
              errors.push(`days[${index}].tasks[${taskIndex}].taskId is required`)
            }
            if (!task.title) {
              errors.push(`days[${index}].tasks[${taskIndex}].title is required`)
            }
            if (!task.type || !PLAN_TASK_TYPES.includes(task.type)) {
              errors.push(`days[${index}].tasks[${taskIndex}].type must be one of: ${PLAN_TASK_TYPES.join(', ')}`)
            }
            if (!task.estimatedMinutes || Number(task.estimatedMinutes) <= 0) {
              errors.push(`days[${index}].tasks[${taskIndex}].estimatedMinutes must be greater than 0`)
            }
          })
        }
      })
    }
  }

  if (errors.length) {
    throw new AppError(errors.join(', '), 400)
  }
}

function validateTaskUpdateInput(body) {
  const errors = []
  const { status, timeSpentMinutes, completedAt } = body

  if (status !== undefined && !PLAN_TASK_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${PLAN_TASK_STATUSES.join(', ')}`)
  }

  if (timeSpentMinutes !== undefined && (Number.isNaN(Number(timeSpentMinutes)) || Number(timeSpentMinutes) < 0)) {
    errors.push('timeSpentMinutes must be a non-negative number')
  }

  if (completedAt !== undefined && completedAt !== null && Number.isNaN(new Date(completedAt).getTime())) {
    errors.push('completedAt must be a valid date')
  }

  if (status === undefined && timeSpentMinutes === undefined && completedAt === undefined) {
    errors.push('at least one of status, timeSpentMinutes, or completedAt is required')
  }

  if (errors.length) {
    throw new AppError(errors.join(', '), 400)
  }
}

module.exports = {
  validateUserInput,
  validateGoalInput,
  validatePlanInput,
  validateTaskUpdateInput,
}
