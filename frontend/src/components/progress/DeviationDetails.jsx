import Card from '../common/Card'
import Badge from '../common/Badge'
import { ACTION_LABEL, PROGRESS_STATUS, SEVERITY } from '../dashboard/PlanStatusCard'

function Stat({ label, value, sub }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-ink">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

// Every number here comes from GET /api/progress/:planId/deviation
export default function DeviationDetails({ deviation }) {
  const status = PROGRESS_STATUS[deviation.progressStatus] ?? PROGRESS_STATUS.ON_TRACK
  const severity = SEVERITY[deviation.severity] ?? SEVERITY.NONE
  const gap = deviation.progressGap

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <p className="text-xs text-slate-500">Deviation from plan</p>
        <div className="flex items-center gap-2">
          <Badge tone={status.tone}>{status.label}</Badge>
          <Badge tone={severity.tone}>{severity.label}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <Stat label="Overall completion" value={`${deviation.overallCompletion}%`} />
        <Stat label="Expected by today" value={`${deviation.expectedCompletion}%`} />
        <Stat label="Progress gap" value={`${gap > 0 ? '+' : ''}${gap} pts`} sub={gap >= 0 ? 'ahead / level' : 'behind'} />
        <Stat label="Days remaining" value={deviation.daysRemaining} />
        <Stat label="Days completed" value={`${deviation.completedDays}/${deviation.totalDays}`} />
        <Stat label="Missed days" value={deviation.missedDays} sub={`${deviation.consecutiveMissedDays} in a row (max)`} />
        <Stat label="Skipped tasks" value={deviation.taskCounts.skipped} sub={`${deviation.taskCounts.partial} partial`} />
        <Stat label="Suggested action" value={ACTION_LABEL[deviation.recommendedAction] ?? deviation.recommendedAction} />
      </div>

      <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
        {deviation.deviationDetected
          ? 'PrepPilot detected a deviation from your plan. Run “Analyze my progress” on the dashboard for an AI recommendation.'
          : 'No deviation detected — you are following your plan.'}
      </p>
    </Card>
  )
}
