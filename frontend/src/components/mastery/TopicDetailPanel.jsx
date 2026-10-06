import Card from '../common/Card'
import Badge from '../common/Badge'
import MasteryTrendChart from './MasteryTrendChart'
import { PRIORITY_COLOR } from '../../utils/constants'
import { formatDate, formatMinutesToHours } from '../../utils/formatters'

export default function TopicDetailPanel({ topic }) {
  if (!topic) {
    return (
      <Card className="flex items-center justify-center text-sm text-slate-400 h-full min-h-[240px]">
        Select a topic to see details
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="font-sans font-semibold text-ink">{topic.topic}</h3>
        <Badge className={PRIORITY_COLOR[topic.priority]}>{topic.priority} priority</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-xs text-slate-500">Completion</p>
          <p className="text-lg font-semibold text-ink">{topic.mastery}%</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Time studied</p>
          <p className="text-lg font-semibold text-ink">
            {formatMinutesToHours(topic.actualMinutes)} <span className="text-xs font-normal text-slate-400">/ {formatMinutesToHours(topic.plannedMinutes)}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Tasks completed</p>
          <p className="text-lg font-semibold text-ink">
            {topic.solved} / {topic.total}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Last practiced</p>
          <p className="text-lg font-semibold text-ink">{topic.lastPracticed ? formatDate(topic.lastPracticed) : 'Not yet'}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs text-slate-500 mb-2">Completion trend</p>
        <MasteryTrendChart trend={topic.trend} />
      </div>

      {topic.revisionNeeded && (
        <div className="mt-2 rounded-md bg-amber-50 px-3 py-2.5 text-sm text-signal-amber">
          Some tasks in this topic were skipped, left partial or are overdue — worth revisiting.
        </div>
      )}
    </Card>
  )
}
