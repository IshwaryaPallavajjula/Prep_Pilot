import Card from '../common/Card'
import ProgressRing from '../common/ProgressRing'

export default function BeforeAfterComparison({ result }) {
  return (
    <Card>
      <p className="text-xs text-slate-500 mb-4">Projected completion by interview day</p>
      <div className="flex items-center justify-around">
        <div className="flex flex-col items-center gap-2">
          <ProgressRing value={result.currentReadiness} size={88} tone="#5B6472" />
          <p className="text-xs text-slate-500">Current pace</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ProgressRing
            value={result.simulatedReadiness}
            size={88}
            tone={result.simulatedReadiness >= result.currentReadiness ? '#1D9A6C' : '#D5544A'}
          />
          <p className="text-xs text-slate-500">Scenario</p>
        </div>
      </div>
    </Card>
  )
}
