import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Card from '../common/Card'

export default function StudyHoursChart({ history }) {
  const data = history.map((d) => ({
    label: d.label,
    planned: Math.round((d.plannedMinutes / 60) * 10) / 10,
    studied: Math.round((d.studiedMinutes / 60) * 10) / 10,
  }))

  return (
    <Card>
      <p className="text-xs text-slate-500 mb-4">Study hours per plan day — planned vs. studied</p>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">Study time appears here once your plan days begin.</p>
      ) : (
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ left: -20 }}>
              <CartesianGrid vertical={false} stroke="#EEF0F3" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8B93A1' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8B93A1' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value, name) => [`${value}h`, name === 'planned' ? 'Planned' : 'Studied']} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} formatter={(v) => (v === 'planned' ? 'Planned' : 'Studied')} />
              <Bar dataKey="planned" fill="#B9C9FF" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="studied" fill="#3455E8" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
