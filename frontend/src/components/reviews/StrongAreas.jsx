import Card from '../common/Card'
import { CheckCircle2 } from 'lucide-react'

export default function StrongAreas({ items }) {
  return (
    <Card>
      <p className="text-xs text-slate-500 mb-3">Strong areas</p>
      {items.length === 0 && <p className="text-sm text-slate-500">Nothing to report yet.</p>}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.topic} className="flex gap-2.5">
            <CheckCircle2 size={16} className="text-signal-green mt-0.5 shrink-0" />
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
