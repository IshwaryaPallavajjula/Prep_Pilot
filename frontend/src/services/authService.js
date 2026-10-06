import { apiRequest, clearStoredSession, getStoredSession, storeSession } from './api'
import { LEGACY_STORAGE_KEY } from '../utils/constants'

function initials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'PP'
  )
}

// Server payload -> the session shape the app uses everywhere
function toSession(data, token) {
  return {
    user: { ...data.user, avatarInitials: initials(data.user.name) },
    token: token ?? data.token,
    onboardingComplete: Boolean(data.onboardingComplete),
  }
}

export function persistSession(session) {
  storeSession(session)
}

export function loadSession() {
  // The old mock-auth build kept a fake session here - never trust it.
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    // ignore
  }

  const stored = getStoredSession()
  return stored?.token && stored?.user?._id ? stored : null
}

export async function signup({ name, email, password }) {
  const data = await apiRequest('/auth/signup', {
    method: 'POST',
    auth: false,
    body: { name, email, password },
  })

  const session = toSession(data)
  persistSession(session)
  return session
}

export async function login({ email, password }) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })

  const session = toSession(data)
  persistSession(session)
  return session
}

// Validates the stored token with the server and refreshes the user record.
export async function fetchCurrentSession(existing) {
  const data = await apiRequest('/auth/me')
  const session = toSession(data, existing.token)
  persistSession(session)
  return session
}

export async function updateProfile(patch, existing) {
  const data = await apiRequest('/auth/me', { method: 'PATCH', body: patch })
  const session = toSession(data, existing.token)
  persistSession(session)
  return session
}

export async function changePassword({ currentPassword, newPassword }) {
  await apiRequest('/auth/password', {
    method: 'PUT',
    body: { currentPassword, newPassword },
  })
}

export async function deleteAccount(password) {
  await apiRequest('/auth/me', { method: 'DELETE', body: { password } })
  clearStoredSession()
}

export async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST', handleUnauthorized: false })
  } catch {
    // Logging out must always succeed locally, even if the server is unreachable.
  }
  clearStoredSession()
}
