import { apiRequest } from './api'
import { availabilityToHours } from '../utils/constants'
import { dateKey, todayKey } from '../utils/dates'

// ---- reads ----

export const getActivePlan = () => apiRequest('/plans/me/active')
export const getPlanVersions = () => apiRequest('/plans/me/versions')
export const getGoals = () => apiRequest('/goals/user/me')

// ---- goal ----

export const updateGoal = (goalId, patch) => apiRequest(`/goals/${goalId}`, { method: 'PUT', body: patch })

// Onboarding form state -> the Goal model the backend stores.
// (The form keeps skill levels / preferences flat; the model nests them.)
export function buildGoalPayload(data) {
  return {
    targetRole: data.targetRole,
    targetCompanies: data.targetCompanies ?? [],
    interviewDate: dateKey(data.interviewDate),
    dailyStudyHours: data.dailyStudyHours ?? availabilityToHours(data.dailyHours),
    studyDays: data.studyDays ?? [],
    preferredStudyTime: data.preferredStudyTime ?? '',
    skillAssessment: {
      dsa: data.dsa || 'Beginner',
      csFundamentals: data.csFundamentals || 'Beginner',
      systemDesign: data.systemDesign || 'Beginner',
    },
    topicAssessment: data.topics ?? {},
    preparationPreferences: {
      difficultyPreference: data.difficulty || 'Balanced',
      sessionStyle: data.sessionStyle || 'Mixed practice',
      mockInterviews: data.mockInterviews ?? true,
      weekendIntensity: data.weekendIntensity || 'Same as weekdays',
    },
  }
}

// 1. create the Goal   2. ask the backend (Gemini) to generate + save the Plan.
// The logged-in user comes from the auth token - no userId is sent.
// `goalId` lets a retry reuse the goal created by a previous failed attempt.
export async function createPlanFromOnboarding(data, { goalId, onGoalCreated } = {}) {
  let id = goalId

  if (!id) {
    const goal = await apiRequest('/goals', { method: 'POST', body: buildGoalPayload(data) })
    id = goal._id
    onGoalCreated?.(id)
  }

  const plan = await apiRequest('/ai/generate-plan', {
    method: 'POST',
    body: { goalId: id, startDate: todayKey() },
  })

  return { goalId: id, plan }
}

// ---- adaptive loop ----

export const adaptPlan = ({ planId, userRequested }) =>
  apiRequest('/ai/adapt-plan', {
    method: 'POST',
    body: { planId, ...(userRequested ? { userRequested } : {}) },
  })

export const getRecommendation = (planId) =>
  apiRequest('/recommendations', { method: 'POST', body: { planId } })
