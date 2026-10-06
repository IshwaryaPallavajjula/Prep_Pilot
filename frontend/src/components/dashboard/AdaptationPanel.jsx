import { useState } from 'react'
import { Sparkles, RefreshCcw, CheckCircle2, Wrench, GitBranch } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import Badge from '../common/Badge'
import Dialog from '../common/Dialog'
import { usePlan } from '../../hooks/usePlan'
import { useToast } from '../../context/ToastContext'
import { errorMessage } from '../../services/api'
import { formatTimestamp } from '../../utils/dates'
import { PRIORITY_COLOR } from '../../utils/constants'

const OUTCOMES = {
  CONTINUE: {
    icon: CheckCircle2,
    title: 'Your current plan continues',
    detail: 'The AI found no reason to change your schedule.',
    tone: 'text-signal-green bg-emerald-50',
  },
  ADJUST: {
    icon: Wrench,
    title: 'Your plan has been adjusted',
    detail: 'A catch-up session was added to your upcoming schedule.',
    tone: 'text-signal-amber bg-amber-50',
  },
  REPLAN: {
    icon: GitBranch,
    title: 'A new adaptive plan version was created',
    detail: 'Your previous version was archived and progress continues on the new one.',
    tone: 'text-runway-600 bg-runway-50',
  },
}

// The adaptive loop in the UI: analyze progress -> AI decision -> (new plan version)
export default function AdaptationPanel() {
  const { plan, adaptation, adapting, runAdaptation } = usePlan()
  const toast = useToast()
  const [confirmReplan, setConfirmReplan] = useState(false)

  // Prefer the decision from this session, then the last one saved on the plan,
  // then the reason this version was created.
  const origin = plan.adaptation && plan.adaptation.action !== 'INITIAL' ? plan.adaptation : null
  const analysis = adaptation ?? plan.lastAnalysis ?? origin
  const outcome = analysis ? OUTCOMES[analysis.action] : null

  async function run(userRequested) {
    try {
      const result = await runAdaptation({ userRequested })

      if (result.action === 'REPLAN') toast.success(`New plan version v${result.newVersion} created.`)
      else if (result.action === 'ADJUST') toast.success('Plan adjusted — a catch-up session was added.')
      else toast.info('Your plan is on track — no changes needed.')
    } catch (error) {
      toast.error(errorMessage(error, 'The analysis failed. Please try again.'))
    }
  }

  const analysedAt = analysis?.receivedAt ?? analysis?.createdAt

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-runway-50 text-runway-600">
          <Sparkles size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink">Adaptive planning</p>
            <Badge tone="runway">Plan v{plan.version}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            PrepPilot compares your progress with the plan and decides whether to continue, adjust or replan.
          </p>
        </div>
      </div>

      {adapting && (
        <p className="mt-4 rounded-md bg-runway-50 px-3 py-2 text-sm text-runway-700" role="status">
          Analyzing your progress with AI… this can take up to a minute.
        </p>
      )}

      {outcome && !adapting && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-start gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${outcome.tone}`}>
              <outcome.icon size={15} />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                {analysis.action === 'REPLAN' && analysis.newVersion
                  ? `A new adaptive plan (v${analysis.newVersion}) was created`
                  : outcome.title}
              </p>
              <p className="text-xs text-slate-500">
                {outcome.detail}
                {analysedAt && ` · ${formatTimestamp(analysedAt, { year: true })}`}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600">{analysis.reason}</p>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge tone="neutral">Focus: {analysis.focusArea}</Badge>
            <Badge tone="neutral">{analysis.suggestedMinutes} min suggested</Badge>
            <Badge tone="neutral" className={PRIORITY_COLOR[analysis.priority]}>
              {analysis.priority} priority
            </Badge>
          </div>

          {analysis.recommendations?.length > 0 && (
            <ul className="space-y-1.5">
              {analysis.recommendations.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-600">
                  <span className="text-runway-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" icon={Sparkles} onClick={() => run()} loading={adapting}>
          Analyze my progress
        </Button>
        <Button size="sm" variant="secondary" icon={RefreshCcw} disabled={adapting} onClick={() => setConfirmReplan(true)}>
          Replan with AI
        </Button>
      </div>

      <Dialog
        open={confirmReplan}
        onClose={() => setConfirmReplan(false)}
        title="Create a new plan version?"
        description="PrepPilot will generate a fresh plan from today using your latest goal and progress. Your current version is archived and stays in your version history."
        confirmLabel="Replan"
        onConfirm={() => {
          setConfirmReplan(false)
          run('REPLAN')
        }}
      />
    </Card>
  )
}
