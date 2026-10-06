import { Loader2 } from 'lucide-react'

export default function LoadingState({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 py-16 text-slate-400 ${className}`}>
      <Loader2 size={22} className="animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
