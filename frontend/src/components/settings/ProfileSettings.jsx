import { useEffect, useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'

export default function ProfileSettings({ user, onSave }) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Follow the stored account (e.g. after a save or a refresh)
  useEffect(() => {
    setName(user.name)
    setEmail(user.email)
  }, [user.name, user.email])

  const changed = name.trim() !== user.name || email.trim().toLowerCase() !== user.email

  async function handleSave() {
    setError('')

    if (!name.trim()) return setError('Name cannot be empty.')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.')

    setSaving(true)
    try {
      await onSave({ name: name.trim(), email: email.trim() })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <h3 className="font-sans font-semibold text-ink mb-4">Profile</h3>
      <div className="space-y-4 max-w-sm">
        {error && (
          <p role="alert" className="text-sm text-signal-red bg-red-50 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        <label className="block text-sm">
          <span className="font-medium text-ink">Full name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus-visible:focus-ring"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus-visible:focus-ring"
          />
        </label>
        <Button size="sm" onClick={handleSave} loading={saving} disabled={!changed}>
          Save changes
        </Button>
      </div>
    </Card>
  )
}
