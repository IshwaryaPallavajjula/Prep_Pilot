import { Flame } from 'lucide-react'
import MetricCard from '../common/MetricCard'

export default function StreakCard({ streak, consistency }) {
  return (
    <MetricCard
      icon={Flame}
      tone="text-signal-amber bg-amber-50"
      label="Current streak"
      value={`${streak} ${streak === 1 ? 'day' : 'days'}`}
      sublabel={`${consistency}% consistency`}
    />
  )
}
