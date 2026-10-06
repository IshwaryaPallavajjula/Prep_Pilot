import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import ProgressBar from '../common/ProgressBar'
import { TASK_STATUS } from '../../utils/constants'
import { formatDate, formatMinutesToHours } from '../../utils/formatters'

const HEADINGS = {
  today: "Today's focus",
  upcoming: 'Next session',
  finished: 'Last session of this plan',
}

export default function TodayFocusCard({ day, relation }) {
  if (!day) return null

  const tasks = day.tasks

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500">
            {HEADINGS[relation] ?? "Today's focus"} · Day {day.dayNumber} · {formatDate(day.date)}
          </p>
          <h3 className="font-sans font-semibold text-ink mt-0.5">{day.focus}</h3>
        </div>
        <span className="text-xs text-slate-500 shrink-0 text-right">
          Planned {formatMinutesToHours(day.plannedMinutes)}
          <br />
          Actual {formatMinutesToHours(day.actualMinutes)}
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {tasks.map((task) => (
          <li key={task.taskId} className="flex items-center gap-2.5 text-sm">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                task.status === TASK_STATUS.DONE
                  ? 'bg-signal-green'
                  : task.status === TASK_STATUS.PARTIAL
                  ? 'bg-signal-amber'
                  : task.status === TASK_STATUS.SKIPPED
                  ? 'bg-signal-red'
                  : 'bg-slate-300'
              }`}
            />
            <span className={task.status === TASK_STATUS.DONE ? 'text-slate-400 line-through' : 'text-ink'}>{task.title}</span>
            <span className="ml-auto text-xs text-slate-400 shrink-0">{task.estimatedMinutes}m</span>
          </li>
        ))}
      </ul>

      <ProgressBar className="mt-4" value={day.completion} label="Day completion" tone={day.completion === 100 ? 'success' : 'runway'} />

      <div className="mt-4 flex justify-end">
        <Link to="/today">
          <Button variant="secondary" size="sm" icon={ArrowRight}>
            Open today's plan
          </Button>
        </Link>
      </div>
    </Card>
  )
}
