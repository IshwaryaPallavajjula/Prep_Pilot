import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Card from '../common/Card'

export default function WorkloadChart({ dailyHours, baselineHours = 2 }) {
  const data = [
    { label: 'Current plan', hours: baselineHours },
    { label: 'Simulated', hours: dailyHours },
  ]

  return (
    <Card>
      <p className="text-xs text-slate-500 mb-4">Daily workload comparison</p>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid vertical={false} stroke="#EEF0F3" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8B93A1' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#8B93A1' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value) => [`${value}h`, 'Hours/day']} />
            <Bar dataKey="hours" fill="#3455E8" radius={[4, 4, 0, 0]} barSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
