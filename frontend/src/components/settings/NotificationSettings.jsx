import Card from '../common/Card'

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-runway-600' : 'bg-slate-200'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export default function NotificationSettings({ notifications, onChange }) {
  return (
    <Card>
      <h3 className="font-sans font-semibold text-ink mb-1">Notifications</h3>
      <p className="text-xs text-slate-500">Preferences are saved to your account. Reminder delivery is not enabled in this demo build.</p>
      <ToggleRow
        label="Daily reminder"
        description="A nudge when today's plan hasn't been started."
        checked={notifications.dailyReminder}
        onChange={(v) => onChange({ ...notifications, dailyReminder: v })}
      />
      <ToggleRow
        label="Weekly review"
        description="A summary every Sunday of how the week went."
        checked={notifications.weeklyReview}
        onChange={(v) => onChange({ ...notifications, weeklyReview: v })}
      />
      <ToggleRow
        label="Plan adjustments"
        description="Alerts whenever the planner changes your schedule."
        checked={notifications.planAdjustments}
        onChange={(v) => onChange({ ...notifications, planAdjustments: v })}
      />
    </Card>
  )
}
