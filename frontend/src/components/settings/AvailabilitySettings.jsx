import { useEffect, useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import Select from '../common/Select'
import { AVAILABILITY_OPTIONS, WEEKDAYS, availabilityToHours, hoursToAvailability } from '../../utils/constants'

export default function AvailabilitySettings({ goal, onSave }) {
  const [dailyHours, setDailyHours] = useState(hoursToAvailability(goal.dailyStudyHours))
  const [studyDays, setStudyDays] = useState(goal.studyDays ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setDailyHours(hoursToAvailability(goal.dailyStudyHours))
    setStudyDays(goal.studyDays ?? [])
  }, [goal.dailyStudyHours, goal.studyDays])

  const original = [...(goal.studyDays ?? [])].sort().join()
  const changed =
    availabilityToHours(dailyHours) !== goal.dailyStudyHours || [...studyDays].sort().join() !== original

  function toggleDay(day) {
    setStudyDays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day]))
  }

  async function handleSave() {
    setError('')
    if (!studyDays.length) return setError('Select at least one study day.')

    setSaving(true)
    try {
      await onSave({ dailyStudyHours: availabilityToHours(dailyHours), studyDays })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <h3 className="font-sans font-semibold text-ink mb-4">Availability</h3>
      <div className="space-y-4 max-w-sm">
        {error && (
          <p role="alert" className="text-sm text-signal-red bg-red-50 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        <Select label="Daily availability" value={dailyHours} onChange={setDailyHours} options={AVAILABILITY_OPTIONS} />

        <div>
          <p className="text-sm font-medium text-ink mb-2">Study days</p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`h-9 w-12 rounded-md text-sm font-medium border transition-colors ${
                  studyDays.includes(day) ? 'bg-runway-50 border-runway-300 text-runway-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Your current plan keeps its schedule until you ask PrepPilot to replan with the new availability.
        </p>
        <Button size="sm" onClick={handleSave} loading={saving} disabled={!changed}>
          Save changes
        </Button>
      </div>
    </Card>
  )
}
