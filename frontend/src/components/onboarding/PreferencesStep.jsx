import { DIFFICULTY_PREFERENCES, SESSION_STYLES } from '../../utils/constants'

function OptionGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="text-sm font-medium text-ink mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-3.5 py-2 rounded-md text-sm font-medium border transition-colors ${
              value === option
                ? 'bg-runway-600 border-runway-600 text-white'
                : 'border-slate-200 text-ink hover:border-slate-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function PreferencesStep({ data, onChange }) {
  return (
    <div className="space-y-6">
      <OptionGroup
        label="Difficulty preference"
        options={DIFFICULTY_PREFERENCES}
        value={data.difficulty || 'Balanced'}
        onChange={(v) => onChange({ difficulty: v })}
      />
      <OptionGroup
        label="Session style"
        options={SESSION_STYLES}
        value={data.sessionStyle || 'Mixed practice'}
        onChange={(v) => onChange({ sessionStyle: v })}
      />
      <div className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-ink">Include mock interviews</p>
          <p className="text-xs text-slate-500">Scheduled periodically alongside your regular sessions.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ mockInterviews: !data.mockInterviews })}
          className={`h-6 w-11 rounded-full transition-colors relative ${
            data.mockInterviews ? 'bg-runway-600' : 'bg-slate-200'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              data.mockInterviews ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
      <OptionGroup
        label="Weekend intensity"
        options={['Lighter than weekdays', 'Same as weekdays', 'Heavier than weekdays']}
        value={data.weekendIntensity || 'Same as weekdays'}
        onChange={(v) => onChange({ weekendIntensity: v })}
      />
    </div>
  )
}
