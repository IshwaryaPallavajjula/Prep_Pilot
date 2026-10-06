import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import Card from '../common/Card'
import { Link } from 'react-router-dom'

export default function TopicMasteryChart({ topics }) {
  const data = topics.slice(0, 6).map((t) => ({
    name: t.topic.length > 22 ? `${t.topic.slice(0, 21)}…` : t.topic,
    mastery: t.mastery,
  }))

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500">Progress by topic</p>
        <Link to="/mastery" className="text-xs font-medium text-runway-600 hover:underline">
          See all
        </Link>
      </div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} stroke="#EEF0F3" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#8B93A1' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fontSize: 12, fill: '#12141C' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: '#F6F6F4' }} formatter={(value) => [`${value}%`, 'Completed']} />
            <Bar dataKey="mastery" fill="#3455E8" radius={[0, 4, 4, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
