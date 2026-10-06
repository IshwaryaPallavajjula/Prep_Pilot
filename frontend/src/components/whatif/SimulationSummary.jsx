import MetricCard from '../common/MetricCard'
import { Gauge, ListTodo } from 'lucide-react'

export default function SimulationSummary({ result }) {
  const delta = result.simulatedReadiness - result.currentReadiness
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <MetricCard
        icon={Gauge}
        label="Projected plan completion"
        value={`${result.simulatedReadiness}%`}
        trend={{ positive: delta >= 0, label: `${delta >= 0 ? '+' : ''}${delta}% vs current` }}
      />
      <MetricCard icon={ListTodo} label="Extra tasks that won't fit" value={result.tasksAffected} />
    </div>
  )
}
