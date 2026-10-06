import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import ProgressBar from '../common/ProgressBar'

export const PROGRESS_STATUS = {
  AHEAD: { label: 'Ahead of plan', tone: 'success' },
  ON_TRACK: { label: 'On track', tone: 'runway' },
  BEHIND: { label: 'Behind plan', tone: 'danger' },
}

export const SEVERITY = {
  NONE: { label: 'No deviation', tone: 'success' },
  LOW: { label: 'Low deviation', tone: 'neutral' },
  MEDIUM: { label: 'Medium deviation', tone: 'amber' },
  HIGH: { label: 'High deviation', tone: 'danger' },
}

export const ACTION_LABEL = {
  CONTINUE: 'Continue as planned',
  MONITOR: 'Keep an eye on it',
  ADJUST: 'Adjust the plan',
  REPLAN: 'Replan',
}

export default function PlanStatusCard({ deviation, version, showLink = true }) {
  if (!deviation) return null

  const status = PROGRESS_STATUS[deviation.progressStatus] ?? PROGRESS_STATUS.ON_TRACK
  const severity = SEVERITY[deviation.severity] ?? SEVERITY.NONE
  const gap = deviation.progressGap

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-runway-600" />
          <p className="text-xs text-slate-500">Plan health · v{version}</p>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <div className="mt-4 space-y-3.5">
        <ProgressBar label="Overall progress" value={deviation.overallCompletion} tone="runway" />
        <ProgressBar label="Expected by today" value={deviation.expectedCompletion} tone="amber" />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {gap === 0 ? 'Exactly on schedule.' : gap > 0 ? `${gap} points ahead of schedule.` : `${Math.abs(gap)} points behind schedule.`}
        {' '}
        {deviation.daysRemaining} {deviation.daysRemaining === 1 ? 'day' : 'days'} until the interview.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <Badge tone={severity.tone}>{severity.label}</Badge>
        <span className="text-xs text-slate-500">
          Suggested: <span className="font-medium text-ink">{ACTION_LABEL[deviation.recommendedAction] ?? deviation.recommendedAction}</span>
        </span>
      </div>

      {showLink && (
        <Link to="/progress" className="mt-3 inline-block text-sm font-medium text-runway-600 hover:underline">
          See full deviation analysis
        </Link>
      )}
    </Card>
  )
}
