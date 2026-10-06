import { useMemo } from 'react'
import ProgressSummary from '../../components/progress/ProgressSummary'
import StudyHoursChart from '../../components/progress/StudyHoursChart'
import TaskCompletionChart from '../../components/progress/TaskCompletionChart'
import StatusDistribution from '../../components/progress/StatusDistribution'
import ProgressByTopic from '../../components/progress/ProgressByTopic'
import DeviationDetails from '../../components/progress/DeviationDetails'
import { usePlan } from '../../hooks/usePlan'
import { buildDailySeries, buildStatusDistribution } from '../../utils/planSelectors'

export default function ProgressPage() {
  const { plan, progress, deviation, derived, todayKey } = usePlan()
  const { totals, readiness, streak, topics } = derived

  const counts = progress?.taskCounts ?? totals.counts
  const history = useMemo(() => buildDailySeries(plan, todayKey), [plan, todayKey])
  const distribution = useMemo(() => buildStatusDistribution(counts), [counts])

  const summary = {
    overallCompletion: progress?.averageCompletion ?? totals.completion,
    tasksCompleted: counts.done,
    totalTasks: counts.total,
    actualMinutes: progress?.totalActualMinutes ?? totals.actualMinutes,
    plannedMinutes: progress?.totalPlannedMinutes ?? totals.plannedMinutes,
    currentStreak: streak,
    consistency: readiness.consistency,
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-sans text-2xl font-semibold text-ink">Progress</h2>
        <p className="mt-1 text-sm text-slate-500">How your execution is trending against Plan v{plan.version}.</p>
      </div>

      <ProgressSummary summary={summary} />

      {deviation && (
        <div className="mt-4">
          <DeviationDetails deviation={deviation} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <StudyHoursChart history={history} />
        <TaskCompletionChart history={history} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <StatusDistribution distribution={distribution} />
        <ProgressByTopic topics={topics} />
      </div>
    </div>
  )
}
