import { NavLink } from 'react-router-dom'
import { X, Settings } from 'lucide-react'
import { primaryNavItems } from '../../data/navigation'

export default function MobileDrawer({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
          <span className="font-sans font-semibold text-ink">PrepPilot</span>
          <button onClick={onClose} aria-label="Close menu" className="text-slate-400 hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-runway-50 text-runway-700' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
                isActive ? 'bg-runway-50 text-runway-700' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Settings size={17} />
            Settings
          </NavLink>
        </nav>
      </div>
    </div>
  )
}
