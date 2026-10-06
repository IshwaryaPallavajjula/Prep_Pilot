import { useState } from 'react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import TaskStatusControl from './TaskStatusControl'
import TimeSpentModal from './TimeSpentModal'
import SkipTaskDialog from './SkipTaskDialog'
import { TASK_STATUS, TASK_STATUS_LABEL, STATUS_COLOR, TASK_TYPE_LABEL } from '../../utils/constants'
import { formatMinutesToHours } from '../../utils/formatters'

export default function TaskCard({ task, busy, onStatusChange }) {
  const [timeModalOpen, setTimeModalOpen] = useState(false)
  const [skipDialogOpen, setSkipDialogOpen] = useState(false)

  const done = task.status === TASK_STATUS.DONE

  return (
    <Card className={done ? 'opacity-80' : ''}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`font-medium text-ink ${done ? 'line-through' : ''}`}>{task.title}</h4>
            <Badge tone="neutral" className={STATUS_COLOR[task.status]}>
              {TASK_STATUS_LABEL[task.status]}
            </Badge>
          </div>
          {task.description && <p className="mt-1 text-sm text-slate-500">{task.description}</p>}
          <p className="mt-2 text-xs text-slate-400">
            {TASK_TYPE_LABEL[task.type] ?? task.type} · Est. {formatMinutesToHours(task.estimatedMinutes)}
            {task.timeSpentMinutes > 0 && ` · Spent ${formatMinutesToHours(task.timeSpentMinutes)}`}
          </p>
        </div>
        <TaskStatusControl
          status={task.status}
          busy={busy}
          // Finishing a task with no time recorded assumes the estimate was spent
          onComplete={() => onStatusChange(task, TASK_STATUS.DONE, task.timeSpentMinutes > 0 ? task.timeSpentMinutes : task.estimatedMinutes)}
          onPartial={() => onStatusChange(task, TASK_STATUS.PARTIAL, task.timeSpentMinutes > 0 ? task.timeSpentMinutes : Math.round(task.estimatedMinutes / 2))}
          onSkip={() => setSkipDialogOpen(true)}
          onReset={() => onStatusChange(task, TASK_STATUS.PENDING, 0)}
          onRecordTime={() => setTimeModalOpen(true)}
        />
      </div>

      <TimeSpentModal
        open={timeModalOpen}
        onClose={() => setTimeModalOpen(false)}
        initialMinutes={task.timeSpentMinutes}
        onSave={(minutes) => onStatusChange(task, task.status, minutes)}
      />
      <SkipTaskDialog
        open={skipDialogOpen}
        onClose={() => setSkipDialogOpen(false)}
        taskTitle={task.title}
        onConfirm={() => onStatusChange(task, TASK_STATUS.SKIPPED, task.timeSpentMinutes)}
      />
    </Card>
  )
}
