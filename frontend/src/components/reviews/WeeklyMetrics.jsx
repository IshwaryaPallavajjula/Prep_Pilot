import MetricCard from '../common/MetricCard'
import { CheckCircle2, Clock, Gauge } from 'lucide-react'

export default function WeeklyMetrics({ review }) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <MetricCard
        icon={CheckCircle2}
        tone="text-signal-green bg-emerald-50"
        label="Tasks completed"
        value={`${review.tasksCompleted}/${review.tasksPlanned}`}
      />
      <MetricCard icon={Clock} label="Study hours" value={`${review.studyHours}h`} />
      <MetricCard icon={Gauge} label="Consistency" value={`${review.consistency}%`} />
    </div>
  )
}
