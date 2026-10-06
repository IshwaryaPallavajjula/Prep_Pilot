import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'
import Button from '../common/Button'
import { signup as signupRequest } from '../../services/authService'
import { errorMessage } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'

export default function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const session = await signupRequest({ name: name.trim(), email: email.trim(), password })
      login(session)
      toast.success('Account created. Let’s build your plan.')
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'Could not create your account. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-signal-red bg-red-50 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      <label className="block">
        <span className="text-sm font-medium text-ink">Full name</span>
        <div className="mt-1.5 relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ananya Rao"
            className="w-full rounded-md border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus-visible:focus-ring"
          />
        </div>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">Email</span>
        <div className="mt-1.5 relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus-visible:focus-ring"
          />
        </div>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">Password</span>
        <div className="mt-1.5 relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-md border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus-visible:focus-ring"
          />
        </div>
      </label>
      <Button type="submit" className="w-full" loading={loading}>
        Create account
      </Button>
    </form>
  )
}
