import Card from '../common/Card'
import ProgressBar from '../common/ProgressBar'

export default function ProgressOverview({ dsa, cs, systemDesign }) {
  return (
    <Card>
      <p className="text-xs text-slate-500 mb-4">Progress by area</p>
      <div className="space-y-4">
        <ProgressBar label="DSA" value={dsa} tone="runway" />
        <ProgressBar label="CS Fundamentals" value={cs} tone="success" />
        <ProgressBar label="System Design" value={systemDesign} tone="amber" />
      </div>
    </Card>
  )
}
