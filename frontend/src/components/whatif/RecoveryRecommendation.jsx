import Card from '../common/Card'
import Badge from '../common/Badge'
import { Lightbulb } from 'lucide-react'

export default function RecoveryRecommendation({ result }) {
  return (
    <Card className="bg-runway-50 border-runway-100">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-runway-600">
          <Lightbulb size={16} />
        </div>
        <div>
          <p className="text-sm font-medium text-ink mb-1">Recommendation</p>
          <p className="text-sm text-slate-600 leading-relaxed">{result.recommendation}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="text-xs text-slate-500 mr-1">Priority topics preserved:</span>
            {result.priorityTopicsPreserved.length === 0 && <span className="text-xs text-slate-400">none</span>}
            {result.priorityTopicsPreserved.map((topic) => (
              <Badge key={topic} tone="runway">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
