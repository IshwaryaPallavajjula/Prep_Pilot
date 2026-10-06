import { Clock } from 'lucide-react'
import MetricCard from '../common/MetricCard'
import { formatMinutesToHours } from '../../utils/formatters'

export default function StudyTimeCard({ actualMinutes, plannedMinutes }) {
  return (
    <MetricCard
      icon={Clock}
      label="Time studied"
      value={formatMinutesToHours(actualMinutes)}
      sublabel={`of ${formatMinutesToHours(plannedMinutes)} planned`}
    />
  )
}
