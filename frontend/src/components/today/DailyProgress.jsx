import Card from '../common/Card'
import ProgressRing from '../common/ProgressRing'

export default function DailyProgress({ completion, tasksDone, totalTasks, minutesSpent, minutesEstimated }) {
  return (
    <Card className="flex items-center gap-5">
      <ProgressRing value={completion} size={80} strokeWidth={8} />
      <div>
        <p className="text-sm text-slate-500">Today's progress</p>
        <p className="text-sm text-ink mt-1">
          {tasksDone} of {totalTasks} tasks · {minutesSpent}m of {minutesEstimated}m
        </p>
      </div>
    </Card>
  )
}
