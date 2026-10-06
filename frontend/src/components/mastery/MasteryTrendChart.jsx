import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function MasteryTrendChart({ trend }) {
  const data = trend.map((value, i) => ({ point: i + 1, value }))

  return (
    <div style={{ width: '100%', height: 160 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: -20 }}>
          <CartesianGrid vertical={false} stroke="#EEF0F3" />
          <XAxis dataKey="point" tick={{ fontSize: 11, fill: '#8B93A1' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#8B93A1' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => [`${value}%`, 'Completion']} labelFormatter={() => ''} />
          <Line type="monotone" dataKey="value" stroke="#3455E8" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
