import { CheckCircle2, Clock, Flame, TrendingUp } from 'lucide-react'
import MetricCard from '../common/MetricCard'
import { formatMinutesToHours } from '../../utils/formatters'

export default function ProgressSummary({ summary }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard icon={TrendingUp} label="Overall completion" value={`${summary.overallCompletion}%`} />
      <MetricCard
        icon={CheckCircle2}
        tone="text-signal-green bg-emerald-50"
        label="Tasks completed"
        value={`${summary.tasksCompleted}/${summary.totalTasks}`}
      />
      <MetricCard
        icon={Clock}
        label="Time studied"
        value={formatMinutesToHours(summary.actualMinutes)}
        sublabel={`of ${formatMinutesToHours(summary.plannedMinutes)} planned`}
      />
      <MetricCard
        icon={Flame}
        tone="text-signal-amber bg-amber-50"
        label="Current streak"
        value={`${summary.currentStreak} ${summary.currentStreak === 1 ? 'day' : 'days'}`}
        sublabel={`${summary.consistency}% consistency`}
      />
    </div>
  )
}
