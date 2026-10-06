import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from './ToastContext'
import { ApiError, clearStoredSession, setUnauthorizedHandler } from '../services/api'
import {
  fetchCurrentSession,
  loadSession,
  logout as logoutRequest,
  persistSession,
  updateProfile as updateProfileRequest,
} from '../services/authService'

export const AppContext = createContext(null)

const DEFAULT_PREFERENCES = {
  theme: 'System',
  notifications: { dailyReminder: true, weeklyReview: true, planAdjustments: true },
}

export function AppProvider({ children }) {
  const toast = useToast()

  const [session, setSession] = useState(() => loadSession())
  // When a stored token exists we confirm it with the server before trusting it.
  const [authReady, setAuthReady] = useState(() => !loadSession())

  // Any 401 from the API drops the app back to the login screen in one place.
  useEffect(() => {
    setUnauthorizedHandler((message) => {
      clearStoredSession()
      setSession((current) => {
        if (current) toast.warning(message || 'Your session has expired. Please log in again.')
        return null
      })
    })
    return () => setUnauthorizedHandler(null)
  }, [toast])

  // Validate the stored session on startup
  useEffect(() => {
    const stored = loadSession()
    if (!stored) return undefined

    let cancelled = false

    fetchCurrentSession(stored)
      .then((fresh) => {
        if (!cancelled) setSession(fresh)
      })
      .catch((error) => {
        // 401 is handled by the unauthorized handler. For "server unreachable"
        // we keep the stored session so a refresh does not log the user out.
        if (!(error instanceof ApiError) || error.status !== 401) {
          if (!cancelled) toast.error(error.message)
        }
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback((newSession) => {
    persistSession(newSession)
    setSession(newSession)
    setAuthReady(true)
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setSession(null)
  }, [])

  // Drops the local session without contacting the server (used after account deletion)
  const clearSession = useCallback(() => {
    clearStoredSession()
    setSession(null)
  }, [])

  const setOnboardingComplete = useCallback((complete) => {
    setSession((current) => {
      if (!current || current.onboardingComplete === complete) return current
      const next = { ...current, onboardingComplete: complete }
      persistSession(next)
      return next
    })
  }, [])

  const updateProfile = useCallback(
    async (patch) => {
      const next = await updateProfileRequest(patch, session)
      setSession(next)
      return next.user
    },
    [session]
  )

  const user = session?.user ?? null

  const preferences = useMemo(
    () => ({
      ...DEFAULT_PREFERENCES,
      ...(user?.preferences ?? {}),
      notifications: { ...DEFAULT_PREFERENCES.notifications, ...(user?.preferences?.notifications ?? {}) },
    }),
    [user]
  )

  const value = {
    session,
    user,
    isAuthenticated: Boolean(session?.token),
    authReady,
    onboardingComplete: Boolean(session?.onboardingComplete),
    login,
    logout,
    clearSession,
    completeOnboarding: () => setOnboardingComplete(true),
    setOnboardingComplete,
    updateProfile,
    preferences,
    updatePreferences: (patch) => updateProfile({ preferences: patch }),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
