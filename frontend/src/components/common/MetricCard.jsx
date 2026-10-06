import Card from './Card'

export default function MetricCard({ icon: Icon, label, value, sublabel, tone = 'text-runway-600 bg-runway-50', trend }) {
  return (
    <Card className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold font-sans text-ink">{value}</p>
        {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
        {trend && (
          <p className={`mt-1 text-xs font-medium ${trend.positive ? 'text-signal-green' : 'text-signal-red'}`}>
            {trend.label}
          </p>
        )}
      </div>
      {Icon && (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${tone}`}>
          <Icon size={18} />
        </div>
      )}
    </Card>
  )
}
