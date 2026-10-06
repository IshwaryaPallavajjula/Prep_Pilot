import { AVAILABILITY_OPTIONS, WEEKDAYS, availabilityToHours } from '../../utils/constants'

export default function AvailabilityStep({ data, onChange }) {
  function toggleDay(day) {
    const current = data.studyDays || []

    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day]

    onChange({ studyDays: next })
  }

  function handleAvailability(option) {
    // Convert "4 hours" -> 4
    const hours = availabilityToHours(option)

    onChange({
      dailyHours: option,
      dailyStudyHours: hours,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-ink mb-2">
          Daily availability
        </p>

        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleAvailability(option)}
              className={`px-3.5 py-2 rounded-md text-sm font-medium border transition-colors ${
                data.dailyHours === option
                  ? 'bg-runway-600 border-runway-600 text-white'
                  : 'border-slate-200 text-ink hover:border-slate-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink mb-2">
          Study days
        </p>

        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`h-10 w-14 rounded-md text-sm font-medium border transition-colors ${
                (data.studyDays || []).includes(day)
                  ? 'bg-runway-50 border-runway-300 text-runway-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}