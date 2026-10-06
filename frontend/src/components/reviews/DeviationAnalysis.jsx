import Card from '../common/Card'
import Badge from '../common/Badge'

export default function DeviationAnalysis({ deviation }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500">Deviation from plan</p>
        {deviation.planAdjustmentTriggered && <Badge tone="amber">Triggered plan update</Badge>}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <p className="text-xs text-slate-400">Days missed</p>
          <p className="font-medium text-ink">{deviation.daysMissed}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Tasks skipped</p>
          <p className="font-medium text-ink">{deviation.tasksSkipped}</p>
        </div>
      </div>
      <p className="text-sm text-slate-600">{deviation.note}</p>
    </Card>
  )
}
