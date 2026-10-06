import Card from '../common/Card'
import { formatMinutesToHours } from '../../utils/formatters'

export default function PlanComparison({ versions }) {
  const previous = versions[versions.length - 2]
  const current = versions[versions.length - 1]

  if (!previous) {
    return (
      <Card>
        <p className="text-xs text-slate-500 mb-2">Version comparison</p>
        <p className="text-sm text-slate-600">
          You are on the first version of your plan. When PrepPilot replans, the differences between versions show up here.
        </p>
      </Card>
    )
  }

  const rows = [
    ['Days', (v) => v.totalDays],
    ['Tasks', (v) => v.totalTasks],
    ['Planned time', (v) => formatMinutesToHours(v.plannedMinutes)],
    ['Completed', (v) => `${v.completionPercentage}%`],
  ]

  return (
    <Card>
      <p className="text-xs text-slate-500 mb-4">
        Plan v{previous.version} → Plan v{current.version}
      </p>
      <div className="grid grid-cols-3 gap-y-2 text-sm">
        <span />
        <span className="text-xs text-slate-400">Before (v{previous.version})</span>
        <span className="text-xs text-slate-400">After (v{current.version})</span>
        {rows.map(([label, get]) => (
          <div key={label} className="contents">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-600">{get(previous)}</span>
            <span className="text-ink font-medium">{get(current)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
