import Card from '../common/Card'
import Badge from '../common/Badge'
import { formatDate, formatMinutesToHours } from '../../utils/formatters'

const TRIGGER = {
  INITIAL: 'Initial plan created',
  REPLAN: 'Adaptive replan',
  ADJUST: 'Plan adjusted',
  CONTINUE: 'Plan continued',
}

export function versionChanges(v) {
  return [
    `${v.totalDays} days · ${v.totalTasks} tasks · ${formatMinutesToHours(v.plannedMinutes)} planned`,
    `${v.completionPercentage}% complete${v.actualMinutes ? ` · ${formatMinutesToHours(v.actualMinutes)} studied` : ''}`,
    ...(v.firstFocus ? [`Starts with ${v.firstFocus}`] : []),
  ]
}

export default function PlanVersionHistory({ versions }) {
  return (
    <Card>
      <p className="text-xs text-slate-500 mb-4">Plan version history</p>
      <div className="space-y-5">
        {versions
          .slice()
          .reverse()
          .map((v) => {
            const trigger = TRIGGER[v.adaptation?.action] ?? 'Plan created'

            return (
              <div key={v._id} className="border-l-2 border-slate-200 pl-4 relative">
                <div className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full ${v.status === 'ACTIVE' ? 'bg-runway-500' : 'bg-slate-300'}`} />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">
                    Plan v{v.version}{' '}
                    <Badge tone={v.status === 'ACTIVE' ? 'success' : 'neutral'} className="ml-1 align-middle">
                      {v.status === 'ACTIVE' ? 'Active' : 'Archived'}
                    </Badge>
                  </p>
                  <p className="text-xs text-slate-400 shrink-0">{formatDate(v.createdAt, { year: true })}</p>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{trigger}</p>
                {v.adaptation?.reason && <p className="text-sm text-slate-600 mt-1.5">{v.adaptation.reason}</p>}
                <ul className="mt-2 space-y-1">
                  {versionChanges(v).map((change) => (
                    <li key={change} className="text-xs text-slate-500 flex gap-1.5">
                      <span>–</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
      </div>
    </Card>
  )
}
