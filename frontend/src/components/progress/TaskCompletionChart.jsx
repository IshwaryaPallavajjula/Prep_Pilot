import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card from '../common/Card'

export default function TaskCompletionChart({ history }) {
  const data = history.map((d) => ({ label: d.label, tasks: d.tasksCompleted }))

  return (
    <Card>
      <p className="text-xs text-slate-500 mb-4">Tasks completed per plan day</p>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">Completed tasks appear here as you work through your plan.</p>
      ) : (
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid vertical={false} stroke="#EEF0F3" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8B93A1' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#8B93A1' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="tasks" fill="#1D9A6C" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}
    </Card>
  )
}
