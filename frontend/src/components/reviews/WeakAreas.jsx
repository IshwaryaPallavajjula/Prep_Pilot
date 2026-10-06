import Card from '../common/Card'
import { AlertTriangle } from 'lucide-react'

export default function WeakAreas({ items }) {
  return (
    <Card>
      <p className="text-xs text-slate-500 mb-3">Weak areas</p>
      {items.length === 0 && <p className="text-sm text-slate-500">Nothing to report yet.</p>}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.topic} className="flex gap-2.5">
            <AlertTriangle size={16} className="text-signal-red mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-ink">{item.topic}</p>
              <p className="text-xs text-slate-500">{item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
