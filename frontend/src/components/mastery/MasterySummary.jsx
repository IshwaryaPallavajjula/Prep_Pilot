import MetricCard from '../common/MetricCard'
import { Target, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function MasterySummary({ topics }) {
  const avg = topics.length ? Math.round(topics.reduce((sum, t) => sum + t.mastery, 0) / topics.length) : 0
  const highPriority = topics.filter((t) => t.priority === 'HIGH').length
  const strong = topics.filter((t) => t.mastery >= 75).length

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <MetricCard icon={Target} label="Average completion" value={`${avg}%`} />
      <MetricCard
        icon={AlertTriangle}
        tone="text-signal-red bg-red-50"
        label="High priority topics"
        value={highPriority}
        sublabel="Need focused attention"
      />
      <MetricCard
        icon={CheckCircle2}
        tone="text-signal-green bg-emerald-50"
        label="Strong topics"
        value={strong}
        sublabel="75% complete or above"
      />
    </div>
  )
}
