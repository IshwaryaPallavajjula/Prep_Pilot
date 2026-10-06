import { useEffect, useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import Select from '../common/Select'
import DatePicker from '../common/DatePicker'
import { ROLES } from '../../utils/constants'
import { dateKey, todayKey } from '../../utils/dates'

export default function GoalSettings({ goal, onSave }) {
  const [targetRole, setTargetRole] = useState(goal.targetRole)
  const [interviewDate, setInterviewDate] = useState(dateKey(goal.interviewDate))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setTargetRole(goal.targetRole)
    setInterviewDate(dateKey(goal.interviewDate))
  }, [goal.targetRole, goal.interviewDate])

  const changed = targetRole !== goal.targetRole || interviewDate !== dateKey(goal.interviewDate)

  async function handleSave() {
    setError('')
    if (!interviewDate) return setError('Pick your interview date.')
    if (interviewDate < todayKey()) return setError('Your interview date cannot be in the past.')

    setSaving(true)
    try {
      await onSave({ targetRole, interviewDate })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <h3 className="font-sans font-semibold text-ink mb-4">Goal</h3>
      <div className="space-y-4 max-w-sm">
        {error && (
          <p role="alert" className="text-sm text-signal-red bg-red-50 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        <Select label="Target role" value={targetRole} onChange={setTargetRole} options={ROLES} />
        <DatePicker label="Interview date" value={interviewDate} min={todayKey()} onChange={setInterviewDate} />
        <Button size="sm" onClick={handleSave} loading={saving} disabled={!changed}>
          Save changes
        </Button>
      </div>
    </Card>
  )
}
