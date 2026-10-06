import TaskCard from './TaskCard'
import EmptyState from '../common/EmptyState'
import { ListChecks } from 'lucide-react'

export default function TaskList({ tasks, pendingTaskIds = [], onStatusChange }) {
  if (tasks.length === 0) {
    return <EmptyState icon={ListChecks} title="No tasks scheduled for this day" description="Check My Plan for what's coming up next." />
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.taskId} task={task} busy={pendingTaskIds.includes(task.taskId)} onStatusChange={onStatusChange} />
      ))}
    </div>
  )
}
