import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import PlanProgressBadge from './PlanProgressBadge'
import { formatDate, formatMinutesToHours } from '../../utils/formatters'
import { STATUS_COLOR, TASK_STATUS_LABEL, TASK_TYPE_LABEL } from '../../utils/constants'

export default function PlanDayCard({ day, isToday }) {
  const [open, setOpen] = useState(false)

  return (
    <Card padded={false} className={isToday ? 'border-runway-300 ring-1 ring-runway-200' : ''}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-ink">
            {day.dayNumber}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink truncate">
              {day.focus}
              {isToday && <span className="ml-2 align-middle"><Badge tone="runway">Today</Badge></span>}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {day.category} · {formatDate(day.date)} · {day.counts.total} tasks · {formatMinutesToHours(day.plannedMinutes)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <PlanProgressBadge status={day.status} />
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <ul className="border-t border-slate-100 divide-y divide-slate-100">
          {day.tasks.map((task) => (
            <li key={task.taskId} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
              <div className="min-w-0">
                <p className="text-ink">{task.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {TASK_TYPE_LABEL[task.type] ?? task.type} · {task.estimatedMinutes}m
                  {task.timeSpentMinutes > 0 && ` · spent ${task.timeSpentMinutes}m`}
                </p>
              </div>
              <Badge className={STATUS_COLOR[task.status]}>{TASK_STATUS_LABEL[task.status]}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
