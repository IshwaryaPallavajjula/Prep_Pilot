import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { errorMessage } from '../services/api'
import { adaptPlan, getActivePlan, getGoals, getPlanVersions, updateGoal as updateGoalRequest } from '../services/planService'
import { getPlanDeviation, getPlanProgress, updateTaskProgress } from '../services/progressService'
import { todayKey as computeTodayKey } from '../utils/dates'
import {
  buildReadiness,
  buildTopicStats,
  computeStreak,
  pickCurrentDay,
  planTotals,
} from '../utils/planSelectors'

export const PlanContext = createContext(null)

const EMPTY = { status: 'idle', error: null, plan: null, goal: null, progress: null, deviation: null }

// Applies the server's answer for one task to the locally held plan
function applyTaskResult(plan, result) {
  return {
    ...plan,
    days: plan.days.map((day) =>
      day.dayNumber !== result.dayNumber
        ? day
        : {
            ...day,
            completionPercentage: result.dayCompletionPercentage,
            tasks: day.tasks.map((task) => (task.taskId === result.task.taskId ? { ...task, ...result.task } : task)),
          }
    ),
  }
}

export function PlanProvider({ children }) {
  const { user, isAuthenticated, onboardingComplete, setOnboardingComplete } = useAuth()
  const userId = user?._id ?? null

  const [state, setState] = useState(EMPTY)
  const [versions, setVersions] = useState(null)
  const [versionsError, setVersionsError] = useState(null)
  const [adaptation, setAdaptation] = useState(null) // the last AI result of this session
  const [adapting, setAdapting] = useState(false)
  const [pendingTaskIds, setPendingTaskIds] = useState([])
  const [today, setToday] = useState(computeTodayKey)

  const loadId = useRef(0)
  const planRef = useRef(null)
  const queue = useRef(Promise.resolve())

  planRef.current = state.plan

  // Keep "today" correct if the tab stays open past midnight
  useEffect(() => {
    const sync = () => setToday((current) => {
      const next = computeTodayKey()
      return next === current ? current : next
    })
    window.addEventListener('focus', sync)
    const timer = setInterval(sync, 60000)
    return () => {
      window.removeEventListener('focus', sync)
      clearInterval(timer)
    }
  }, [])

  const load = useCallback(async ({ silent = false } = {}) => {
    const id = ++loadId.current

    if (!silent) setState((s) => ({ ...s, status: 'loading', error: null }))

    try {
      const [plan, goals] = await Promise.all([getActivePlan(), getGoals()])
      if (id !== loadId.current) return null

      let progress = null
      let deviation = null

      if (plan) {
        ;[progress, deviation] = await Promise.all([getPlanProgress(plan._id), getPlanDeviation(plan._id)])
        if (id !== loadId.current) return null
      }

      const goal = (plan && goals.find((g) => g._id === plan.goalId)) || goals[0] || null

      setState({ status: 'ready', error: null, plan, goal, progress, deviation })
      return plan
    } catch (error) {
      if (id === loadId.current) {
        setState((s) => ({ ...s, status: 'error', error: errorMessage(error, 'Could not load your plan.') }))
      }
      return null
    }
  }, [])

  // (Re)load whenever the signed-in account changes; wipe everything on logout.
  useEffect(() => {
    loadId.current += 1 // invalidate any in-flight request from the previous account
    setVersions(null)
    setAdaptation(null)
    setPendingTaskIds([])
    queue.current = Promise.resolve()

    if (!isAuthenticated || !userId) {
      setState(EMPTY)
      return
    }

    load()
  }, [userId, isAuthenticated, load])

  // The server is the source of truth for "has this user finished onboarding?"
  useEffect(() => {
    if (state.status !== 'ready') return
    if (state.plan && !onboardingComplete) setOnboardingComplete(true)
    if (!state.plan && onboardingComplete) setOnboardingComplete(false)
  }, [state.status, state.plan, onboardingComplete, setOnboardingComplete])

  const refreshMetrics = useCallback(async (planId) => {
    const [progress, deviation] = await Promise.all([getPlanProgress(planId), getPlanDeviation(planId)])
    setState((s) => (s.plan?._id === planId ? { ...s, progress, deviation } : s))
  }, [])

  // Task updates run one at a time so quick clicks can never overwrite each other.
  const updateTask = useCallback(
    (taskId, patch) => {
      setPendingTaskIds((ids) => [...ids, taskId])

      const run = async () => {
        const planId = planRef.current?._id
        if (!planId) throw new Error('No active plan to update.')

        const result = await updateTaskProgress({ planId, taskId, ...patch })

        setState((s) => (s.plan?._id === planId ? { ...s, plan: applyTaskResult(s.plan, result) } : s))
        await refreshMetrics(planId)

        return result
      }

      const promise = queue.current.then(run)
      queue.current = promise.catch(() => {})

      return promise.finally(() => setPendingTaskIds((ids) => ids.filter((id) => id !== taskId)))
    },
    [refreshMetrics]
  )

  // The adaptive loop: progress + deviation + weak areas -> Gemini -> CONTINUE / ADJUST / REPLAN
  const runAdaptation = useCallback(
    async ({ userRequested } = {}) => {
      const planId = planRef.current?._id
      if (!planId) throw new Error('No active plan to analyze.')

      setAdapting(true)

      try {
        const result = await adaptPlan({ planId, userRequested })

        // Keep the decision, not the (large) plan documents that come with it.
        const { plan: _plan, progress: _progress, deviation: _deviation, ...summary } = result
        setAdaptation({ ...summary, receivedAt: new Date().toISOString() })

        setVersions(null) // versions may have changed
        await load({ silent: true })

        return result
      } finally {
        setAdapting(false)
      }
    },
    [load]
  )

  const loadVersions = useCallback(async () => {
    setVersionsError(null)
    try {
      setVersions(await getPlanVersions())
    } catch (error) {
      setVersionsError(errorMessage(error, 'Could not load plan versions.'))
    }
  }, [])

  const updateGoal = useCallback(async (patch) => {
    const goalId = state.goal?._id
    if (!goalId) throw new Error('No goal found for this account.')
    const goal = await updateGoalRequest(goalId, patch)
    setState((s) => ({ ...s, goal }))
    return goal
  }, [state.goal])

  const derived = useMemo(() => {
    if (!state.plan) return null

    return {
      totals: planTotals(state.plan),
      current: pickCurrentDay(state.plan, today),
      readiness: buildReadiness(state.plan, today),
      topics: buildTopicStats(state.plan, today),
      streak: computeStreak(state.plan, today),
    }
  }, [state.plan, today])

  const value = {
    ...state,
    loading: state.status === 'idle' || state.status === 'loading',
    todayKey: today,
    derived,
    versions,
    versionsError,
    adaptation,
    adapting,
    pendingTaskIds,
    refresh: load,
    updateTask,
    runAdaptation,
    loadVersions,
    updateGoal,
  }

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}
