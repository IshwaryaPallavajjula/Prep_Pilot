import Card from '../common/Card'
import { formatMinutesToHours } from '../../utils/formatters'

export default function TimeAnalysis({ analysis }) {
  return (
    <Card>
      <p className="text-xs text-slate-500 mb-3">Time analysis</p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-slate-400">Planned</p>
          <p className="font-medium text-ink">{formatMinutesToHours(analysis.plannedMinutes)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Actual</p>
          <p className="font-medium text-ink">{formatMinutesToHours(analysis.actualMinutes)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Most productive</p>
          <p className="font-medium text-ink">{analysis.mostProductiveDay}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Least productive</p>
          <p className="font-medium text-ink">{analysis.leastProductiveDay}</p>
        </div>
      </div>
    </Card>
  )
}
