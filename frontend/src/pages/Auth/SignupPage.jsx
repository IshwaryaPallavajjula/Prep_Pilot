import { Link, Navigate } from 'react-router-dom'
import Card from '../../components/common/Card'
import SignupForm from '../../components/auth/SignupForm'
import { useAuth } from '../../hooks/useAuth'

export default function SignupPage() {
  const { isAuthenticated, onboardingComplete } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={onboardingComplete ? '/dashboard' : '/onboarding'} replace />
  }

  return (
    <Card className="w-full max-w-sm">
      <h1 className="font-sans text-xl font-semibold text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Set up your personalized prep plan in a few steps.</p>
      <div className="mt-6">
        <SignupForm />
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-runway-600 hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  )
}
