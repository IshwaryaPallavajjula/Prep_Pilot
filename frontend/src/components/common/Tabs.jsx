export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 rounded-md bg-slate-100 p-1 w-fit ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-sm transition-colors focus-visible:focus-ring ${
            active === tab.value ? 'bg-white text-ink shadow-sm' : 'text-slate-500 hover:text-ink'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
