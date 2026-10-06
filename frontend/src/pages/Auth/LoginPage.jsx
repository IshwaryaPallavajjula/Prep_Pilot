import { Link, Navigate } from 'react-router-dom'
import Card from '../../components/common/Card'
import LoginForm from '../../components/auth/LoginForm'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const { isAuthenticated, onboardingComplete } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={onboardingComplete ? '/dashboard' : '/onboarding'} replace />
  }

  return (
    <Card className="w-full max-w-sm">
      <h1 className="font-sans text-xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Log in to continue your prep plan.</p>
      <div className="mt-6">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        New to PrepPilot?{' '}
        <Link to="/signup" className="font-medium text-runway-600 hover:underline">
          Create an account
        </Link>
      </p>
    </Card>
  )
}
