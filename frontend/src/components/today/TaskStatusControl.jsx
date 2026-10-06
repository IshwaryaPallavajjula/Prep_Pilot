import { Check, Clock, SkipForward, CircleDashed, RotateCcw, Loader2 } from 'lucide-react'
import { TASK_STATUS } from '../../utils/constants'

export default function TaskStatusControl({ status, busy, onComplete, onPartial, onSkip, onReset, onRecordTime }) {
  const base = 'flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-50'

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {busy && <Loader2 size={15} className="animate-spin text-slate-400" aria-label="Saving" />}
      <button onClick={onRecordTime} disabled={busy} title="Record time spent" aria-label="Record time spent" className={`${base} text-slate-400 hover:bg-slate-100 hover:text-ink`}>
        <Clock size={15} />
      </button>
      {status !== TASK_STATUS.PENDING && (
        <button onClick={onReset} disabled={busy} title="Reset to not started" aria-label="Reset to not started" className={`${base} text-slate-400 hover:bg-slate-100 hover:text-ink`}>
          <RotateCcw size={15} />
        </button>
      )}
      <button
        onClick={onPartial}
        disabled={busy}
        title="Mark partial"
        aria-label="Mark partial"
        className={`${base} hover:bg-amber-50 ${status === TASK_STATUS.PARTIAL ? 'bg-amber-100 text-signal-amber' : 'text-slate-400 hover:text-signal-amber'}`}
      >
        <CircleDashed size={15} />
      </button>
      <button
        onClick={onSkip}
        disabled={busy}
        title="Skip task"
        aria-label="Skip task"
        className={`${base} hover:bg-red-50 ${status === TASK_STATUS.SKIPPED ? 'bg-red-100 text-signal-red' : 'text-slate-400 hover:text-signal-red'}`}
      >
        <SkipForward size={15} />
      </button>
      <button
        onClick={onComplete}
        disabled={busy}
        title="Mark complete"
        aria-label="Mark complete"
        className={`${base} hover:bg-emerald-50 ${status === TASK_STATUS.DONE ? 'bg-emerald-100 text-signal-green' : 'text-slate-400 hover:text-signal-green'}`}
      >
        <Check size={15} />
      </button>
    </div>
  )
}
