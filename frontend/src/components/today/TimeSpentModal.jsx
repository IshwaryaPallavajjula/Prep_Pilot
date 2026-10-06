import { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'

export default function TimeSpentModal({ open, onClose, onSave, initialMinutes = 0 }) {
  const [minutes, setMinutes] = useState(String(initialMinutes))

  // Always start from the task's current value when the dialog opens
  useEffect(() => {
    if (open) setMinutes(String(initialMinutes ?? 0))
  }, [open, initialMinutes])

  const value = Number(minutes)
  const valid = minutes !== '' && Number.isFinite(value) && value >= 0

  function handleSave() {
    if (!valid) return
    onSave(Math.round(value))
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record time spent"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!valid}>
            Save
          </Button>
        </>
      }
    >
      <label className="block text-sm">
        <span className="font-medium text-ink">Minutes spent</span>
        <input
          type="number"
          min={0}
          autoFocus
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus-visible:focus-ring"
        />
        {!valid && <span className="mt-1 block text-xs text-signal-red">Enter a number of minutes (0 or more).</span>}
      </label>
    </Modal>
  )
}
