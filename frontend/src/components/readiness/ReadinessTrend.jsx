import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Card from '../common/Card'
import { formatDate } from '../../utils/formatters'

export default function ReadinessTrend({ history }) {
  const data = history.map((h) => ({ label: formatDate(h.date), value: h.overall }))

  return (
    <Card>
      <p className="text-xs text-slate-500 mb-4">Readiness trend</p>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">The trend appears once your first plan day begins.</p>
      ) : (
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ left: -20 }}>
            <CartesianGrid vertical={false} stroke="#EEF0F3" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8B93A1' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#8B93A1' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value) => [`${value}%`, 'Readiness']} />
            <Line type="monotone" dataKey="value" stroke="#3455E8" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      )}
    </Card>
  )
}
