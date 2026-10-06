import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import Card from '../common/Card'
import { ACTION_LABEL, SEVERITY } from './PlanStatusCard'

// Shown on the daily view when the backend detects a deviation from the plan
export default function DeviationBanner({ deviation }) {
  if (!deviation?.deviationDetected) return null

  const severity = SEVERITY[deviation.severity] ?? SEVERITY.LOW

  return (
    <Card className="mb-5 border-amber-100 bg-amber-50/60">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-signal-amber" />
        <div className="text-sm">
          <p className="font-medium text-ink">{severity.label} detected</p>
          <p className="mt-0.5 text-slate-600">
            {deviation.taskCounts.skipped} skipped, {deviation.taskCounts.partial} partial, {deviation.missedDays} missed{' '}
            {deviation.missedDays === 1 ? 'day' : 'days'}. Suggested next step: {ACTION_LABEL[deviation.recommendedAction]?.toLowerCase() ?? deviation.recommendedAction}.{' '}
            <Link to="/dashboard" className="font-medium text-runway-600 hover:underline">
              Analyze and adapt my plan
            </Link>
          </p>
        </div>
      </div>
    </Card>
  )
}
