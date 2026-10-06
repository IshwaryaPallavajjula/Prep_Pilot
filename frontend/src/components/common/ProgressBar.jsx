export default function ProgressBar({ value, tone = 'runway', label, className = '' }) {
  const clamped = Math.min(100, Math.max(0, value))
  const toneColor = {
    runway: 'bg-runway-500',
    success: 'bg-signal-green',
    amber: 'bg-signal-amber',
    danger: 'bg-signal-red',
  }[tone]

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>{label}</span>
          <span className="font-medium text-ink">{clamped}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${toneColor} transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
