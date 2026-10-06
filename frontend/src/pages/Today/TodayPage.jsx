import { useEffect, useState } from 'react'
import TodayHeader from '../../components/today/TodayHeader'
import DailyProgress from '../../components/today/DailyProgress'
import TaskList from '../../components/today/TaskList'
import DeviationBanner from '../../components/dashboard/DeviationBanner'
import { usePlan } from '../../hooks/usePlan'
import { useToast } from '../../context/ToastContext'
import { errorMessage } from '../../services/api'
import { getDays, daySummary } from '../../utils/planSelectors'
import { dateKey } from '../../utils/dates'
import { TASK_STATUS } from '../../utils/constants'

export default function TodayPage() {
  const { plan, derived, deviation, todayKey, pendingTaskIds, updateTask } = usePlan()
  const toast = useToast()

  const days = getDays(plan)
  const defaultDay = derived.current.day
  const [selected, setSelected] = useState(defaultDay?.dayNumber ?? 1)

  // When the plan version changes (replan) jump back to its current day
  useEffect(() => {
    setSelected(defaultDay?.dayNumber ?? 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan._id])

  const index = Math.max(0, days.findIndex((d) => d.dayNumber === selected))
  const rawDay = days[index]
  const day = daySummary(rawDay)

  const key = dateKey(rawDay.date)
  const relation = key === todayKey ? 'today' : key < todayKey ? (defaultDay?.dayNumber === rawDay.dayNumber ? 'finished' : 'past') : 'future'

  async function handleStatusChange(task, status, timeSpentMinutes) {
    try {
      await updateTask(task.taskId, { status, timeSpentMinutes })

      if (status === TASK_STATUS.DONE) toast.success('Task completed.')
      else if (status === TASK_STATUS.SKIPPED) toast.info('Task skipped.')
      else if (status === TASK_STATUS.PARTIAL) toast.info('Marked as partly done.')
      else if (status === TASK_STATUS.PENDING) toast.info('Task reset.')
      else toast.success('Time saved.')
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update the task. Please try again.'))
    }
  }

  return (
    <div>
      <TodayHeader
        date={rawDay.date}
        dayNumber={rawDay.dayNumber}
        totalDays={days.length}
        focus={rawDay.focus}
        relation={relation}
        version={plan.version}
        onPrev={index > 0 ? () => setSelected(days[index - 1].dayNumber) : null}
        onNext={index < days.length - 1 ? () => setSelected(days[index + 1].dayNumber) : null}
      />

      <DeviationBanner deviation={deviation} />

      <div className="mb-5">
        <DailyProgress
          completion={day.completion}
          tasksDone={day.counts.done}
          totalTasks={day.counts.total}
          minutesSpent={day.actualMinutes}
          minutesEstimated={day.plannedMinutes}
        />
      </div>

      <TaskList tasks={rawDay.tasks} pendingTaskIds={pendingTaskIds} onStatusChange={handleStatusChange} />
    </div>
  )
}
