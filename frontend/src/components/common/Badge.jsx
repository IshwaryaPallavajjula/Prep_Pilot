const TONES = {
  neutral: 'bg-slate-100 text-slate-600',
  runway: 'bg-runway-100 text-runway-700',
  success: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-600',
  danger: 'bg-red-100 text-red-600',
}

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}>
      {children}
    </span>
  )
}
