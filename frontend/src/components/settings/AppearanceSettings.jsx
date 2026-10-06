import Card from '../common/Card'
import { Sun, Moon, Monitor } from 'lucide-react'

const OPTIONS = [
  { value: 'Light', icon: Sun },
  { value: 'Dark', icon: Moon },
  { value: 'System', icon: Monitor },
]

export default function AppearanceSettings({ theme, onChange }) {
  return (
    <Card>
      <h3 className="font-sans font-semibold text-ink mb-4">Appearance</h3>
      <div className="flex gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border transition-colors ${
              theme === opt.value ? 'border-runway-500 bg-runway-50 text-runway-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <opt.icon size={16} />
            {opt.value}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">Your choice is saved to your account. PrepPilot currently always uses the light theme.</p>
    </Card>
  )
}
