import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { deleteAccount } from '../../services/authService'
import { errorMessage } from '../../services/api'

export default function AccountSettings() {
  const { logout, clearSession } = useAuth()
  const toast = useToast()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleLogout() {
    await logout()
    toast.info('You have been logged out.')
  }

  async function handleDelete() {
    setError('')
    if (!password) return setError('Enter your password to confirm.')

    setDeleting(true)
    try {
      await deleteAccount(password)
      clearSession()
      toast.info('Your account and all its data were deleted.')
    } catch (err) {
      setError(errorMessage(err, 'Could not delete your account.'))
      setDeleting(false)
    }
  }

  function closeDelete() {
    if (deleting) return
    setDeleteOpen(false)
    setPassword('')
    setError('')
  }

  return (
    <Card>
      <h3 className="font-sans font-semibold text-ink mb-2">Account</h3>
      <p className="text-sm text-slate-500 mb-4">Manage your session and account access.</p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Log out
        </Button>
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          Delete account
        </Button>
      </div>

      <Modal
        open={deleteOpen}
        onClose={closeDelete}
        title="Delete your account?"
        footer={
          <>
            <Button variant="secondary" onClick={closeDelete} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete permanently
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This permanently deletes your profile, goal, every plan version and all progress. It cannot be undone.
        </p>
        <label className="mt-4 block text-sm">
          <span className="font-medium text-ink">Confirm with your password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus-visible:focus-ring"
          />
        </label>
        {error && (
          <p role="alert" className="mt-2 text-sm text-signal-red">
            {error}
          </p>
        )}
      </Modal>
    </Card>
  )
}
