import { Link } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'

export default function Header({ onMenuClick, title }) {
  const { user } = useAuth()
  const { deviation } = usePlan()
  const alert = Boolean(deviation?.deviationDetected)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-slate-500 hover:text-ink" aria-label="Open menu">
          <Menu size={22} />
        </button>
        <h1 className="font-sans font-semibold text-ink text-lg">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/progress"
          className="relative text-slate-400 hover:text-ink"
          aria-label={alert ? 'Plan alert: deviation detected' : 'Plan alerts'}
          title={alert ? `Deviation detected (${deviation.severity.toLowerCase()})` : 'No plan alerts'}
        >
          <Bell size={19} />
          {alert && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-signal-red ring-2 ring-white" />}
        </Link>
        <Link
          to="/settings"
          title={user?.name}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white text-xs font-semibold"
        >
          {user?.avatarInitials}
        </Link>
      </div>
    </header>
  )
}
