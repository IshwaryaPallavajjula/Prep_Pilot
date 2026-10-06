import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import LoadingState from '../../components/common/LoadingState'
import GoalStep from '../../components/onboarding/GoalStep'
import AvailabilityStep from '../../components/onboarding/AvailabilityStep'
import SkillAssessmentStep from '../../components/onboarding/SkillAssessmentStep'
import PreferencesStep from '../../components/onboarding/PreferencesStep'
import ReviewStep from '../../components/onboarding/ReviewStep'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { useToast } from '../../context/ToastContext'
import { createPlanFromOnboarding } from '../../services/planService'
import { errorMessage } from '../../services/api'
import { addDaysToKey, todayKey } from '../../utils/dates'
import { availabilityToHours } from '../../utils/constants'

const STEPS = [
  { title: 'Your goal', component: GoalStep },
  { title: 'Availability', component: AvailabilityStep },
  { title: 'Skill assessment', component: SkillAssessmentStep },
  { title: 'Preferences', component: PreferencesStep },
  { title: 'Review', component: ReviewStep },
]

// Sensible starting answers so every step is valid out of the box
function initialData() {
  return {
    targetRole: 'SDE-1',
    targetCompanies: [],
    interviewDate: addDaysToKey(todayKey(), 30),
    dailyHours: '2 hours',
    dailyStudyHours: 2,
    studyDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    dsa: 'Beginner',
    csFundamentals: 'Beginner',
    systemDesign: 'Beginner',
    topics: {},
    difficulty: 'Balanced',
    sessionStyle: 'Mixed practice',
    mockInterviews: true,
    weekendIntensity: 'Same as weekdays',
  }
}

// Returns an error message when the current step is not complete yet
function validateStep(index, data) {
  if (index === 0) {
    if (!data.targetRole) return 'Choose the role you are preparing for.'
    if (!data.interviewDate) return 'Pick your interview date.'
    if (data.interviewDate < todayKey()) return 'Your interview date cannot be in the past.'
  }
  if (index === 1) {
    if (!data.dailyHours || !(availabilityToHours(data.dailyHours) > 0)) return 'Choose how much time you can study each day.'
    if (!data.studyDays?.length) return 'Select at least one study day.'
  }
  return ''
}

export default function OnboardingPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState(initialData)
  const [stepError, setStepError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // If plan generation fails after the goal was saved, a retry reuses that goal
  const [goalId, setGoalId] = useState(null)

  const { isAuthenticated, authReady, completeOnboarding } = useAuth()
  const { plan, loading, refresh } = usePlan()
  const toast = useToast()
  const navigate = useNavigate()

  if (!authReady || (isAuthenticated && loading)) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <LoadingState label="Loading…" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (plan && !submitting) return <Navigate to="/dashboard" replace />

  const StepComponent = STEPS[stepIndex].component
  const isLast = stepIndex === STEPS.length - 1

  function handleChange(patch) {
    setStepError('')
    setData((prev) => ({ ...prev, ...patch }))
  }

  function handleBack() {
    setStepError('')
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  async function handleNext() {
    const problem = validateStep(stepIndex, data)
    if (problem) {
      setStepError(problem)
      return
    }
    setStepError('')

    if (!isLast) {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
      return
    }

    // Final step: 1) create the goal  2) generate + save the plan with Gemini
    setSubmitting(true)

    try {
      await createPlanFromOnboarding(data, { goalId, onGoalCreated: setGoalId })
      await refresh()
      completeOnboarding()
      toast.success('Your personalized plan is ready.')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(errorMessage(error, 'We could not create your plan. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= stepIndex ? 'bg-runway-500' : 'bg-slate-200'}`} />
            </div>
          ))}
        </div>

        <p className="text-sm text-runway-600 font-medium">
          Step {stepIndex + 1} of {STEPS.length}
        </p>

        <h1 className="font-sans text-xl font-semibold text-ink mt-1 mb-6">{STEPS[stepIndex].title}</h1>

        <StepComponent data={data} onChange={handleChange} />

        {stepError && (
          <p role="alert" className="mt-5 text-sm text-signal-red bg-red-50 rounded-md px-3 py-2">
            {stepError}
          </p>
        )}

        {submitting && (
          <p className="mt-5 text-sm text-slate-500">
            PrepPilot is building your personalized plan with AI. This can take up to a minute — please keep this page open.
          </p>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" icon={ArrowLeft} onClick={handleBack} disabled={stepIndex === 0 || submitting}>
            Back
          </Button>

          <Button icon={isLast ? Rocket : ArrowRight} loading={submitting} onClick={handleNext}>
            {isLast ? (submitting ? 'Creating your plan…' : 'Create My Plan') : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
