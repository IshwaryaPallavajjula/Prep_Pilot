import Card from '../common/Card'
import ProgressBar from '../common/ProgressBar'

export default function ReadinessBreakdown({ breakdown }) {
  const rows = [
    ['DSA', breakdown.dsa],
    ['CS Fundamentals', breakdown.cs],
    ['System Design', breakdown.systemDesign],
    ['Consistency', breakdown.consistency],
    ['Revision', breakdown.revision],
    ['Mock Performance', breakdown.mockPerformance],
  ]

  return (
    <Card>
      <p className="text-xs text-slate-500 mb-4">Readiness breakdown</p>
      <div className="space-y-3.5">
        {rows.map(([label, value]) => (
          <ProgressBar key={label} label={label} value={value} tone={value < 40 ? 'danger' : value < 70 ? 'amber' : 'success'} />
        ))}
      </div>
    </Card>
  )
}
