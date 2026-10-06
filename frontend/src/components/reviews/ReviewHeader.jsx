import Select from '../common/Select'

export default function ReviewHeader({ weeks, activeWeek, onChange }) {
  return (
    <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 className="font-sans text-2xl font-semibold text-ink">Weekly Reviews</h2>
        <p className="mt-1 text-sm text-slate-500">A summary of how each week of preparation went.</p>
      </div>
      {weeks.length > 0 && <Select value={activeWeek} onChange={onChange} options={weeks} className="w-56" />}
    </div>
  )
}
