// Pure functions that turn a backend Plan document (plus "today") into the
// numbers and shapes the UI shows. Nothing here is invented: every value is
// derived from the tasks, statuses and minutes stored in MongoDB.

import { DAY_STATUS, TASK_STATUS } from './constants'
import { addDaysToKey, dateKey, diffDays, formatDay, weekdayShort } from './dates'
import { clamp } from './calculations'

const WEIGHT = { DONE: 100, PARTIAL: 50, SKIPPED: 0, PENDING: 0 }

// ---------------------------------------------------------------- tasks

export function completionOf(tasks = []) {
  if (!tasks.length) return 0
  const total = tasks.reduce((sum, t) => sum + (WEIGHT[t.status] ?? 0), 0)
  return Math.round(total / tasks.length)
}

export function countTasks(tasks = []) {
  return {
    total: tasks.length,
    done: tasks.filter((t) => t.status === TASK_STATUS.DONE).length,
    partial: tasks.filter((t) => t.status === TASK_STATUS.PARTIAL).length,
    skipped: tasks.filter((t) => t.status === TASK_STATUS.SKIPPED).length,
    pending: tasks.filter((t) => t.status === TASK_STATUS.PENDING).length,
  }
}

export const sumMinutes = (tasks = [], field = 'estimatedMinutes') =>
  tasks.reduce((sum, t) => sum + (Number(t[field]) || 0), 0)

// Task type -> the category label used by the plan filters
export function taskCategory(type) {
  switch (type) {
    case 'CS_FUNDAMENTALS':
      return 'CS'
    case 'SYSTEM_DESIGN':
      return 'System Design'
    case 'MOCK_INTERVIEW':
      return 'Mock'
    case 'REVISION':
      return 'Revision'
    default:
      return 'DSA'
  }
}

// ---------------------------------------------------------------- days

export function getDays(plan) {
  return [...(plan?.days ?? [])].sort((a, b) => a.dayNumber - b.dayNumber)
}

export function dayStatus(day) {
  const tasks = day.tasks ?? []
  if (!tasks.length) return DAY_STATUS.NOT_STARTED
  const c = countTasks(tasks)

  if (c.done === c.total) return DAY_STATUS.COMPLETED
  if (c.skipped === c.total) return DAY_STATUS.SKIPPED
  if (c.pending === c.total) return DAY_STATUS.NOT_STARTED
  if (c.pending === 0) return DAY_STATUS.PARTIAL
  return DAY_STATUS.IN_PROGRESS
}

// The category that best describes a day (drives the plan filter tabs)
export function dayCategory(day) {
  const tasks = day.tasks ?? []
  const totals = {}

  for (const t of tasks) {
    const cat = taskCategory(t.type)
    totals[cat] = (totals[cat] || 0) + (t.estimatedMinutes || 0)
  }

  const allMinutes = Object.values(totals).reduce((a, b) => a + b, 0) || 1
  const share = (cat) => (totals[cat] || 0) / allMinutes

  if (share('System Design') >= 0.4) return 'System Design'
  if (share('CS') >= 0.4) return 'CS'
  if (share('Mock') >= 0.5) return 'Mock'

  const focus = (day.focus || '').toLowerCase()
  if (/system design|scalab|architect|load balanc|caching/.test(focus)) return 'System Design'
  if (/\b(dbms|database|sql|operating system|os|network|oop|object.oriented|cs fundamental|computer)\b/.test(focus)) return 'CS'
  if (/mock/.test(focus)) return 'Mock'
  if (share('Revision') >= 0.6) return 'Revision'

  return 'DSA'
}

export function daySummary(day) {
  const tasks = day.tasks ?? []
  return {
    dayNumber: day.dayNumber,
    date: dateKey(day.date),
    focus: day.focus,
    tasks,
    counts: countTasks(tasks),
    plannedMinutes: sumMinutes(tasks),
    actualMinutes: sumMinutes(tasks, 'timeSpentMinutes'),
    completion: completionOf(tasks),
    status: dayStatus(day),
    category: dayCategory(day),
  }
}

// Which day should "Today" show?
//   today      - the plan has a day for today's date
//   upcoming   - today is not a study day; show the next one
//   finished   - every day is behind us; show the last one
export function pickCurrentDay(plan, todayKey) {
  const days = getDays(plan)
  if (!days.length) return { day: null, relation: 'empty' }

  const exact = days.find((d) => dateKey(d.date) === todayKey)
  if (exact) return { day: exact, relation: 'today' }

  const next = days.find((d) => dateKey(d.date) > todayKey)
  if (next) return { day: next, relation: 'upcoming' }

  return { day: days[days.length - 1], relation: 'finished' }
}

export function isMissedDay(day, todayKey) {
  const tasks = day.tasks ?? []
  if (!tasks.length) return false
  const key = dateKey(day.date)
  if (key < todayKey) return tasks.every((t) => t.status === 'PENDING' || t.status === 'SKIPPED')
  if (key === todayKey) return tasks.every((t) => t.status === 'SKIPPED')
  return false
}

// Consecutive days (ending today/yesterday) with at least one task done or partly done.
// Days with no plan entry (non-study days) never break a streak.
export function computeStreak(plan, todayKey) {
  const days = getDays(plan)
    .filter((d) => dateKey(d.date) <= todayKey)
    .reverse()

  let streak = 0

  for (const day of days) {
    const active = (day.tasks ?? []).some((t) => t.status === 'DONE' || t.status === 'PARTIAL')
    const isToday = dateKey(day.date) === todayKey

    if (active) streak += 1
    else if (!isToday) break // an empty *today* has not failed yet
  }

  return streak
}

// ---------------------------------------------------------------- totals

export function planTotals(plan) {
  const days = getDays(plan)
  const tasks = days.flatMap((d) => d.tasks ?? [])

  return {
    days: days.length,
    tasks: tasks.length,
    counts: countTasks(tasks),
    completion: completionOf(tasks),
    plannedMinutes: sumMinutes(tasks),
    actualMinutes: sumMinutes(tasks, 'timeSpentMinutes'),
  }
}

// ---------------------------------------------------------------- topics (Mastery)

export function buildTopicStats(plan, todayKey) {
  const groups = new Map()

  for (const day of getDays(plan)) {
    const name = (day.focus || 'General').trim()
    const key = name.toLowerCase()
    if (!groups.has(key)) groups.set(key, { topic: name, days: [] })
    groups.get(key).days.push(day)
  }

  return [...groups.values()].map(({ topic, days }) => {
    const tasks = days.flatMap((d) => d.tasks ?? [])
    const counts = countTasks(tasks)
    const completion = completionOf(tasks)
    const planned = sumMinutes(tasks)
    const actual = sumMinutes(tasks, 'timeSpentMinutes')

    const overdue = days.some(
      (d) => dateKey(d.date) < todayKey && (d.tasks ?? []).some((t) => t.status !== 'DONE')
    )

    const started = counts.done + counts.partial + counts.skipped > 0

    let priority = 'LOW'
    if (counts.skipped > 0 || overdue) priority = 'HIGH'
    else if (counts.partial > 0 || (started && completion < 70)) priority = 'MEDIUM'

    // last practiced = latest completion timestamp, else the latest day with any activity
    const completedAts = tasks.filter((t) => t.completedAt).map((t) => t.completedAt).sort()
    const activeDays = days
      .filter((d) => (d.tasks ?? []).some((t) => t.status !== 'PENDING'))
      .map((d) => dateKey(d.date))
      .sort()

    return {
      topic,
      mastery: completion,
      total: counts.total,
      solved: counts.done,
      attempted: counts.done + counts.partial + counts.skipped,
      plannedMinutes: planned,
      actualMinutes: actual,
      lastPracticed: completedAts.length
        ? completedAts[completedAts.length - 1]
        : activeDays.length
        ? activeDays[activeDays.length - 1]
        : null,
      revisionNeeded: counts.skipped > 0 || counts.partial > 0 || overdue,
      priority,
      // completion after each day of this topic, in order
      trend: days.map((_, i) => completionOf(days.slice(0, i + 1).flatMap((d) => d.tasks ?? []))),
    }
  })
}

// ---------------------------------------------------------------- readiness

const READINESS_WEIGHTS = { dsa: 0.35, cs: 0.2, systemDesign: 0.2, consistency: 0.1, revision: 0.08, mockPerformance: 0.07 }

export function buildReadiness(plan, todayKey) {
  const days = getDays(plan)
  const tasks = days.flatMap((d) => d.tasks ?? [])

  const subset = (types) => tasks.filter((t) => types.includes(t.type))
  const groups = {
    dsa: subset(['LEARN', 'PRACTICE']),
    cs: subset(['CS_FUNDAMENTALS']),
    systemDesign: subset(['SYSTEM_DESIGN']),
    revision: subset(['REVISION']),
    mockPerformance: subset(['MOCK_INTERVIEW']),
  }

  const dueDays = days.filter((d) => dateKey(d.date) <= todayKey)
  const activeDays = dueDays.filter((d) => (d.tasks ?? []).some((t) => t.status === 'DONE' || t.status === 'PARTIAL'))
  const consistency = dueDays.length ? Math.round((activeDays.length / dueDays.length) * 100) : 0

  const scores = {
    dsa: completionOf(groups.dsa),
    cs: completionOf(groups.cs),
    systemDesign: completionOf(groups.systemDesign),
    consistency,
    revision: completionOf(groups.revision),
    mockPerformance: completionOf(groups.mockPerformance),
  }

  // Areas the plan does not contain are left out of the weighted average
  // instead of dragging the score to zero.
  const present = {
    dsa: groups.dsa.length > 0,
    cs: groups.cs.length > 0,
    systemDesign: groups.systemDesign.length > 0,
    consistency: true,
    revision: groups.revision.length > 0,
    mockPerformance: groups.mockPerformance.length > 0,
  }

  let weightSum = 0
  let total = 0
  for (const [key, weight] of Object.entries(READINESS_WEIGHTS)) {
    if (!present[key]) continue
    weightSum += weight
    total += scores[key] * weight
  }

  return {
    ...scores,
    overall: weightSum ? Math.round(total / weightSum) : 0,
    present,
  }
}

// Plan completion after each day that is already due (drives the trend chart)
export function buildReadinessHistory(plan, todayKey) {
  const days = getDays(plan)
  const allCount = days.reduce((n, d) => n + (d.tasks?.length ?? 0), 0) || 1
  const history = []
  let weight = 0

  for (const day of days) {
    if (dateKey(day.date) > todayKey) break
    weight += (day.tasks ?? []).reduce((sum, t) => sum + (WEIGHT[t.status] ?? 0), 0)
    history.push({ date: dateKey(day.date), overall: clamp(Math.round(weight / allCount)) })
  }

  return history
}

export function buildStrengthAndRisk(topics, readiness, todayKey, plan) {
  const strengths = []
  const risks = []

  for (const t of topics) {
    if (t.solved > 0 && t.mastery >= 70) {
      strengths.push({ topic: t.topic, detail: `${t.solved} of ${t.total} tasks completed (${t.mastery}%).` })
    }
    if (t.priority === 'HIGH') {
      const skipped = t.attempted - t.solved
      risks.push({
        topic: t.topic,
        severity: 'HIGH',
        detail: skipped > 0 ? `${skipped} task(s) skipped or left partial; ${t.mastery}% complete.` : `Scheduled earlier but only ${t.mastery}% complete.`,
      })
    } else if (t.priority === 'MEDIUM') {
      risks.push({ topic: t.topic, severity: 'MEDIUM', detail: `In progress at ${t.mastery}% with unfinished tasks.` })
    }
  }

  if (readiness.consistency >= 70 && getDays(plan).some((d) => dateKey(d.date) <= todayKey)) {
    strengths.push({ topic: 'Consistency', detail: `You worked on ${readiness.consistency}% of the days due so far.` })
  }

  return { strengths: strengths.slice(0, 5), risks: risks.slice(0, 5) }
}

// ---------------------------------------------------------------- charts

// One point per plan day that is due (up to the last 14) - planned vs actual
export function buildDailySeries(plan, todayKey) {
  return getDays(plan)
    .filter((d) => dateKey(d.date) <= todayKey)
    .slice(-14)
    .map((d) => {
      const tasks = d.tasks ?? []
      return {
        date: dateKey(d.date),
        label: formatDay(d.date),
        plannedMinutes: sumMinutes(tasks),
        studiedMinutes: sumMinutes(tasks, 'timeSpentMinutes'),
        tasksCompleted: tasks.filter((t) => t.status === 'DONE').length,
      }
    })
}

export function buildStatusDistribution(counts) {
  return [
    { status: 'DONE', label: 'Completed', count: counts.done, color: '#1D9A6C' },
    { status: 'PARTIAL', label: 'Partial', count: counts.partial, color: '#DB9524' },
    { status: 'SKIPPED', label: 'Skipped', count: counts.skipped, color: '#D5544A' },
    { status: 'PENDING', label: 'Not started', count: counts.pending, color: '#B9BEC7' },
  ].filter((entry) => entry.count > 0)
}

// ---------------------------------------------------------------- weekly reviews

export function buildWeeklyReviews(plan, todayKey) {
  const days = getDays(plan)
  if (!days.length) return []

  const startKey = dateKey(days[0].date)
  const weeks = new Map()

  for (const day of days) {
    const key = dateKey(day.date)
    if (key > todayKey) continue // weeks that have not happened yet
    const index = Math.floor(diffDays(startKey, key) / 7)
    if (!weeks.has(index)) weeks.set(index, [])
    weeks.get(index).push(day)
  }

  const topicStatsFor = (weekDays) => buildTopicStats({ days: weekDays }, todayKey)

  return [...weeks.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([index, weekDays]) => {
      const weekStart = addDaysToKey(startKey, index * 7)
      const weekEnd = addDaysToKey(weekStart, 6)
      const tasks = weekDays.flatMap((d) => d.tasks ?? [])
      const counts = countTasks(tasks)
      const planned = sumMinutes(tasks)
      const actual = sumMinutes(tasks, 'timeSpentMinutes')

      const dueDays = weekDays.length
      const activeDays = weekDays.filter((d) => (d.tasks ?? []).some((t) => t.status === 'DONE' || t.status === 'PARTIAL')).length
      const missedDays = weekDays.filter((d) => isMissedDay(d, todayKey)).length

      const byWeekday = {}
      for (const d of weekDays) {
        const name = weekdayShort(dateKey(d.date))
        byWeekday[name] = (byWeekday[name] || 0) + sumMinutes(d.tasks ?? [], 'timeSpentMinutes')
      }
      const ranked = Object.entries(byWeekday).sort((a, b) => b[1] - a[1])
      const hasActivity = ranked.length > 0 && ranked[0][1] > 0

      const topics = topicStatsFor(weekDays)

      const created = plan.adaptation?.createdAt ? dateKey(plan.adaptation.createdAt) : null
      const analysed = plan.lastAnalysis?.planUpdated && plan.lastAnalysis?.createdAt ? dateKey(plan.lastAnalysis.createdAt) : null
      const inWeek = (k) => k && k >= weekStart && k <= weekEnd
      const adjustmentTriggered =
        (plan.adaptation?.action === 'REPLAN' && inWeek(created)) || inWeek(analysed)

      let note = 'No deviation from the plan this week.'
      if (counts.skipped || missedDays) {
        note = `${missedDays ? `${missedDays} day(s) with no work done` : ''}${missedDays && counts.skipped ? ' and ' : ''}${counts.skipped ? `${counts.skipped} skipped task(s)` : ''} this week.`
        note = note.charAt(0).toUpperCase() + note.slice(1)
      }

      return {
        weekLabel: `${formatDay(weekStart)} – ${formatDay(weekEnd)}`,
        tasksPlanned: counts.total,
        tasksCompleted: counts.done,
        studyHours: Math.round((actual / 60) * 10) / 10,
        consistency: dueDays ? Math.round((activeDays / dueDays) * 100) : 0,
        completedTopics: weekDays.filter((d) => dayStatus(d) === DAY_STATUS.COMPLETED).map((d) => d.focus),
        strongAreas: topics
          .filter((t) => t.solved > 0 && t.mastery >= 70)
          .map((t) => ({ topic: t.topic, note: `${t.solved} of ${t.total} tasks completed.` })),
        weakAreas: topics
          .filter((t) => t.priority !== 'LOW')
          .map((t) => ({ topic: t.topic, note: `${t.mastery}% complete${t.attempted - t.solved ? `, ${t.attempted - t.solved} task(s) skipped or partial` : ''}.` })),
        timeAnalysis: {
          plannedMinutes: planned,
          actualMinutes: actual,
          mostProductiveDay: hasActivity ? ranked[0][0] : 'Not enough data yet',
          leastProductiveDay: hasActivity && ranked.length > 1 ? ranked[ranked.length - 1][0] : 'Not enough data yet',
        },
        deviation: {
          daysMissed: missedDays,
          tasksSkipped: counts.skipped,
          planAdjustmentTriggered: Boolean(adjustmentTriggered),
          note,
        },
      }
    })
}
