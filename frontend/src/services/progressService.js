import { apiRequest } from './api'

export const getPlanProgress = (planId) => apiRequest(`/progress/${planId}`)
export const getPlanDeviation = (planId) => apiRequest(`/progress/${planId}/deviation`)

export const updateTaskProgress = ({ planId, taskId, status, timeSpentMinutes }) =>
  apiRequest('/progress/task', {
    method: 'PATCH',
    body: { planId, taskId, status, ...(timeSpentMinutes !== undefined ? { timeSpentMinutes } : {}) },
  })
