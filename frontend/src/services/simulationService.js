import { buildTopicStats, getDays } from '../utils/planSelectors'
import { addDaysToKey, dateKey, weekdayShort } from '../utils/dates'
import { clamp } from '../utils/calculations'

// What-if simulator: a deterministic projection built from the user's real plan.
//
//   remaining work   = minutes of task work not yet done (partial counts half)
//   capacity         = study days left before the interview x hours per day
//   coverage         = share of the remaining work that fits in that capacity
//   projected finish = completion so far + coverage of what is left
//
// "Current" uses the goal's own hours/day and no missed days.

const WEIGHT = { DONE: 1, PARTIAL: 0.5, SKIPPED: 0, PENDING: 0 }

function studyDaysLeft(todayKey, interviewKey, studyDays) {
  const allowed = studyDays?.length ? new Set(studyDays) : null
  let count = 0
  let cursor = todayKey
  let guard = 0

  while (cursor < interviewKey && guard < 800) {
    if (!allowed || allowed.has(weekdayShort(cursor))) count += 1
    cursor = addDaysToKey(cursor, 1)
    guard += 1
  }

  return count
}

export function runSimulation({ dailyHours, missedDays, interviewDate }, { plan, goal, todayKey }) {
  const tasks = getDays(plan).flatMap((d) => d.tasks ?? [])
  const totalTasks = tasks.length || 1

  const remainingMinutes = tasks.reduce(
    (sum, t) => sum + (t.estimatedMinutes || 0) * (1 - (WEIGHT[t.status] ?? 0)),
    0
  )
  const remainingTasks = tasks.reduce((sum, t) => sum + (1 - (WEIGHT[t.status] ?? 0)), 0)
  const completedShare = ((totalTasks - remainingTasks) / totalTasks) * 100

  const interviewKey = dateKey(interviewDate) || dateKey(plan.interviewDate)
  const currentDays = studyDaysLeft(todayKey, dateKey(plan.interviewDate), goal?.studyDays)
  const scenarioDays = Math.max(0, studyDaysLeft(todayKey, interviewKey, goal?.studyDays) - missedDays)

  const project = (days, hours) => {
    const capacity = days * hours * 60
    const coverage = remainingMinutes > 0 ? Math.min(1, capacity / remainingMinutes) : 1
    return { capacity, coverage, projected: clamp(Math.round(completedShare + (100 - completedShare) * coverage)) }
  }

  const baseline = project(currentDays, goal?.dailyStudyHours ?? 2)
  const scenario = project(scenarioDays, dailyHours)

  const tasksAffected = Math.max(
    0,
    Math.round(remainingTasks * (1 - scenario.coverage)) - Math.round(remainingTasks * (1 - baseline.coverage))
  )

  const shortfallMinutes = Math.max(0, remainingMinutes - scenario.capacity)
  const extraPerDay = scenarioDays > 0 ? Math.ceil(shortfallMinutes / scenarioDays) : Math.ceil(shortfallMinutes)

  let recommendation
  if (remainingMinutes === 0) {
    recommendation = 'Everything in your current plan is already done. Ask for a fresh analysis on the dashboard to keep going.'
  } else if (scenarioDays === 0) {
    recommendation = 'No study days remain before the interview date in this scenario. Move the interview date out or cancel the missed days.'
  } else if (shortfallMinutes > 0) {
    recommendation = `At this pace roughly ${Math.round(shortfallMinutes)} minutes of planned work will not fit. Adding about ${extraPerDay} minutes per study day would close the gap.`
  } else if (scenario.projected >= baseline.projected) {
    recommendation = 'This schedule still covers everything left in your plan — the extra time could go to mock interviews and revision.'
  } else {
    recommendation = 'This schedule still finishes your plan, but with less slack than your current one.'
  }

  const topics = buildTopicStats(plan, todayKey)
  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 }
  const priorityTopicsPreserved = [...topics]
    .filter((t) => t.mastery < 100)
    .sort((a, b) => order[a.priority] - order[b.priority])
    .slice(0, 3)
    .map((t) => t.topic)

  return {
    currentReadiness: baseline.projected,
    simulatedReadiness: scenario.projected,
    tasksAffected,
    priorityTopicsPreserved,
    interviewDate: interviewKey,
    recommendation,
  }
}
