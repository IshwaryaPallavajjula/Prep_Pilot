import Card from '../common/Card'
import ProgressBar from '../common/ProgressBar'

export default function ProgressByTopic({ topics }) {
  return (
    <Card>
      <p className="text-xs text-slate-500 mb-4">Progress by topic</p>
      <div className="space-y-3.5">
        {topics.map((t) => (
          <ProgressBar key={t.topic} label={t.topic} value={t.mastery} tone={t.mastery < 40 ? 'danger' : t.mastery < 70 ? 'amber' : 'success'} />
        ))}
      </div>
    </Card>
  )
}
