export default function DatePicker({ label, value, onChange, min, className = '' }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      {label && <span className="font-medium text-ink">{label}</span>}
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus-visible:focus-ring"
      />
    </label>
  )
}
