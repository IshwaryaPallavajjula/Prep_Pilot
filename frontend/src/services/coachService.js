import { apiRequest } from './api'

// Sends a message to the AI coach, which reasons over the user's real plan and progress.
export async function sendMessage(planId, message) {
  const data = await apiRequest(`/coach/${planId}/chat`, { method: 'POST', body: { message } })

  return {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content: data.response,
    timestamp: new Date().toISOString(),
  }
}
