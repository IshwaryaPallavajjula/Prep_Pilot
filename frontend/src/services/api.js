// Centralized API client.
//
// * Attaches the login token and the user's local calendar day to every call.
// * Turns every failure into an ApiError with a message that is safe to show.
// * Reports 401s (expired / invalid session) to whoever registered a handler,
//   so the whole app can drop back to the login screen in one place.

import { SESSION_STORAGE_KEY } from '../utils/constants'
import { todayKey } from '../utils/dates'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export class ApiError extends Error {
  constructor(message, { status = 0, isNetworkError = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.isNetworkError = isNetworkError
  }
}

// ---- token storage ----

export function getStoredSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function storeSession(session) {
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // storage full / blocked - the session simply will not survive a refresh
  }
}

export function clearStoredSession() {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function getToken() {
  return getStoredSession()?.token ?? null
}

// ---- unauthorized handler ----

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

// ---- request ----

export async function apiRequest(path, { method = 'GET', body, auth = true, signal, handleUnauthorized = true } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Client-Date': todayKey(),
  }

  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ApiError(
      'Cannot reach the PrepPilot server. Check your connection and that the backend is running.',
      { isNetworkError: true }
    )
  }

  let payload = null

  try {
    payload = await response.json()
  } catch {
    // non-JSON response
  }

  if (!response.ok || payload?.success === false) {
    const message =
      payload?.message ||
      (response.status >= 500
        ? 'The server ran into a problem. Please try again.'
        : `Request failed (${response.status})`)

    // A 401 on an authenticated call means the session is gone.
    if (response.status === 401 && auth && handleUnauthorized && unauthorizedHandler) {
      unauthorizedHandler(message)
    }

    throw new ApiError(message, { status: response.status })
  }

  return payload?.data ?? null
}

// Small helper so failures can be turned into a user-facing string anywhere.
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof ApiError) return error.message
  if (error?.message) return error.message
  return fallback
}

export function simulateNetworkDelay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
