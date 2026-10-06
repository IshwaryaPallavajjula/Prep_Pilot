import PlanDayCard from './PlanDayCard'
import EmptyState from '../common/EmptyState'
import { CalendarX } from 'lucide-react'

export default function PlanTimeline({ days, todayKey }) {
  if (days.length === 0) {
    return <EmptyState icon={CalendarX} title="No sessions in this category" description="Try a different filter." />
  }
  return (
    <div className="space-y-2.5">
      {days.map((day) => (
        <PlanDayCard key={day.dayNumber} day={day} isToday={day.date === todayKey} />
      ))}
    </div>
  )
}
