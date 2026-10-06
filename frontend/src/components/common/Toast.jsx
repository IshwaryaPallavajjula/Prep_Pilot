import { useEffect } from 'react'
import { CheckCircle2, Info, AlertCircle, XCircle, X } from 'lucide-react'

const ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertCircle,
  error: XCircle,
}

const COLORS = {
  success: 'text-signal-green',
  info: 'text-runway-300',
  warning: 'text-signal-amber',
  error: 'text-signal-red',
}

export default function Toast({ open, onClose, message, tone = 'info', duration = 4000 }) {
  useEffect(() => {
    if (!open) return undefined
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [open, onClose, duration])

  if (!open) return null

  const Icon = ICONS[tone] ?? Info

  return (
    <div className="fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0" role="status" aria-live="polite">
      <div className="flex items-center gap-3 rounded-md bg-ink text-white pl-4 pr-3 py-3 shadow-lg text-sm max-w-sm">
        <Icon size={16} className={`shrink-0 ${COLORS[tone] ?? ''}`} />
        <span className="flex-1">{message}</span>
        <button onClick={onClose} aria-label="Dismiss" className="text-white/60 hover:text-white">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
