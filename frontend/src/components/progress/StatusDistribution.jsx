import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Card from '../common/Card'

export default function StatusDistribution({ distribution }) {
  return (
    <Card>
      <p className="text-xs text-slate-500 mb-4">Task status distribution</p>
      {distribution.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">No tasks yet.</p>
      ) : (
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={distribution} dataKey="count" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={2}>
              {distribution.map((entry) => (
                <Cell key={entry.status} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      )}
    </Card>
  )
}
