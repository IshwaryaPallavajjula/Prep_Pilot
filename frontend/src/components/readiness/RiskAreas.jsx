import Card from '../common/Card'
import Badge from '../common/Badge'
import { AlertTriangle } from 'lucide-react'

export default function RiskAreas({ items }) {
  return (
    <Card>
      <p className="text-xs text-slate-500 mb-3">Risk areas</p>
      {items.length === 0 && <p className="text-sm text-slate-500">Nothing at risk right now — no skipped, partial or overdue work.</p>}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.topic} className="flex gap-2.5">
            <AlertTriangle size={16} className="text-signal-red mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-ink">{item.topic}</p>
                <Badge tone={item.severity === 'HIGH' ? 'danger' : 'amber'}>{item.severity}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
