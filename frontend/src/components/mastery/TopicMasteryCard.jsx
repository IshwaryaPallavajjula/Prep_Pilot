import Card from '../common/Card'
import Badge from '../common/Badge'
import ProgressBar from '../common/ProgressBar'
import { PRIORITY_COLOR } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'

export default function TopicMasteryCard({ topic, onSelect, selected }) {
  return (
    <Card
      as="button"
      onClick={() => onSelect(topic)}
      className={`text-left w-full transition-colors ${selected ? 'border-runway-300 ring-1 ring-runway-200' : ''}`}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-ink">{topic.topic}</h4>
        <Badge className={PRIORITY_COLOR[topic.priority]}>{topic.priority}</Badge>
      </div>
      <div className="mt-3">
        <ProgressBar value={topic.mastery} label="Completed" tone={topic.mastery < 40 ? 'danger' : topic.mastery < 70 ? 'amber' : 'success'} />
      </div>
      <p className="mt-2.5 text-xs text-slate-500">
        {topic.solved}/{topic.total} tasks done · {topic.lastPracticed ? `Last practiced ${formatDate(topic.lastPracticed)}` : 'Not started'}
      </p>
    </Card>
  )
}
