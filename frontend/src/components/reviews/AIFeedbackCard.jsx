import { Sparkles } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'

// The coach's take comes from POST /api/recommendations (Gemini), on demand.
export default function AIFeedbackCard({ feedback, loading, onGenerate }) {
  return (
    <Card className="bg-runway-50 border-runway-100">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-runway-600">
          <Sparkles size={16} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink mb-1">Coach's take</p>
          {feedback ? (
            <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
              <p className="font-medium text-ink">{feedback.recommendation}</p>
              <p>{feedback.reason}</p>
              {feedback.actions?.length > 0 && (
                <ul className="space-y-1">
                  {feedback.actions.map((action) => (
                    <li key={action} className="flex gap-2">
                      <span className="text-runway-500">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-slate-500">
                Focus: {feedback.focusArea} · {feedback.suggestedMinutes} min · {feedback.priority} priority
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Get a personalized recommendation based on your weak areas and progress.</p>
          )}
          <Button className="mt-3" size="sm" variant="secondary" icon={Sparkles} loading={loading} onClick={onGenerate}>
            {feedback ? 'Refresh recommendation' : 'Generate recommendation'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
