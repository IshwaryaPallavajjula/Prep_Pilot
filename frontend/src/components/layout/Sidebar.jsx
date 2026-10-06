import { NavLink } from 'react-router-dom'
import { Settings, LogOut } from 'lucide-react'
import { primaryNavItems } from '../../data/navigation'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const toast = useToast()

  async function handleLogout() {
    await logout()
    toast.info('You have been logged out.')
  }

  return (
    <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col border-r border-slate-200 bg-white h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-runway-600 text-white text-xs font-bold">
          PP
        </div>
        <span className="font-sans font-semibold text-ink">PrepPilot</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {primaryNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:focus-ring ${
                isActive ? 'bg-runway-50 text-runway-700' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-runway-50 text-runway-700' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
            }`
          }
        >
          <Settings size={17} />
          Settings
        </NavLink>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white text-xs font-semibold">
            {user?.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
          </div>
          <button onClick={handleLogout} aria-label="Log out" className="text-slate-400 hover:text-ink">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
