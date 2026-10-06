import DashboardHeader from '../../components/dashboard/DashboardHeader'
import InterviewCountdown from '../../components/dashboard/InterviewCountdown'
import ReadinessCard from '../../components/dashboard/ReadinessCard'
import TodayFocusCard from '../../components/dashboard/TodayFocusCard'
import ProgressOverview from '../../components/dashboard/ProgressOverview'
import StudyTimeCard from '../../components/dashboard/StudyTimeCard'
import StreakCard from '../../components/dashboard/StreakCard'
import TopicMasteryChart from '../../components/dashboard/TopicMasteryChart'
import CoachPreview from '../../components/dashboard/CoachPreview'
import PlanStatusCard from '../../components/dashboard/PlanStatusCard'
import AdaptationPanel from '../../components/dashboard/AdaptationPanel'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { daySummary } from '../../utils/planSelectors'
import { formatDaysRemaining } from '../../utils/formatters'

export default function DashboardPage() {
  const { user } = useAuth()
  const { plan, goal, progress, deviation, derived } = usePlan()

  const { current, readiness, topics, streak, totals } = derived
  const day = current.day ? daySummary(current.day) : null

  const interviewDate = goal?.interviewDate ?? plan.interviewDate
  const companies = goal?.targetCompanies ?? []

  return (
    <div>
      <DashboardHeader name={user.name} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <InterviewCountdown
          daysRemaining={deviation?.daysRemaining ?? formatDaysRemaining(interviewDate)}
          interviewDate={interviewDate}
          targetCompanies={companies}
        />
        <ReadinessCard overall={readiness.overall} />
        <div className="grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-1">
          <StreakCard streak={streak} consistency={readiness.consistency} />
          <StudyTimeCard
            actualMinutes={progress?.totalActualMinutes ?? totals.actualMinutes}
            plannedMinutes={progress?.totalPlannedMinutes ?? totals.plannedMinutes}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2 space-y-4">
          <TodayFocusCard day={day} relation={current.relation} />
          <AdaptationPanel />
          <TopicMasteryChart topics={topics} />
        </div>
        <div className="space-y-4">
          <PlanStatusCard deviation={deviation} version={plan.version} />
          <ProgressOverview dsa={readiness.dsa} cs={readiness.cs} systemDesign={readiness.systemDesign} />
          <CoachPreview focus={day?.focus} />
        </div>
      </div>
    </div>
  )
}
