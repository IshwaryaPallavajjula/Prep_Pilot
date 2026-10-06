import Card from '../common/Card'
import Badge from '../common/Badge'

export default function CompletedTopics({ topics }) {
  return (
    <Card>
      <p className="text-xs text-slate-500 mb-3">Topics completed this week</p>
      {topics.length === 0 && <p className="text-sm text-slate-500">No topics fully completed yet.</p>}
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <Badge key={topic} tone="success">
            {topic}
          </Badge>
        ))}
      </div>
    </Card>
  )
}
