import Badge from '../common/Badge'
import { formatMinutesToHours } from '../../utils/formatters'

export default function PlanHeader({ plan, totals }) {
  return (
    <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 className="font-sans text-2xl font-semibold text-ink">My Plan</h2>
        <p className="mt-1 text-sm text-slate-500">
          {plan.title} · {totals.days} days · {totals.tasks} tasks · {formatMinutesToHours(totals.plannedMinutes)} planned
        </p>
      </div>
      <Badge tone="runway">Current Plan v{plan.version}</Badge>
    </div>
  )
}
