import { useEffect, useMemo, useState } from 'react'
import ReviewHeader from '../../components/reviews/ReviewHeader'
import WeeklyMetrics from '../../components/reviews/WeeklyMetrics'
import CompletedTopics from '../../components/reviews/CompletedTopics'
import StrongAreas from '../../components/reviews/StrongAreas'
import WeakAreas from '../../components/reviews/WeakAreas'
import TimeAnalysis from '../../components/reviews/TimeAnalysis'
import DeviationAnalysis from '../../components/reviews/DeviationAnalysis'
import AIFeedbackCard from '../../components/reviews/AIFeedbackCard'
import { usePlan } from '../../hooks/usePlan'
import { useToast } from '../../context/ToastContext'
import { getRecommendation } from '../../services/planService'
import { errorMessage } from '../../services/api'
import { buildWeeklyReviews } from '../../utils/planSelectors'

export default function ReviewsPage() {
  const { plan, todayKey } = usePlan()
  const toast = useToast()

  const reviews = useMemo(() => buildWeeklyReviews(plan, todayKey), [plan, todayKey])
  const [activeWeek, setActiveWeek] = useState(reviews[0]?.weekLabel ?? null)
  const [feedback, setFeedback] = useState(null)
  const [loadingFeedback, setLoadingFeedback] = useState(false)

  // A new plan version starts a new review history
  useEffect(() => {
    setActiveWeek(reviews[0]?.weekLabel ?? null)
    setFeedback(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan._id])

  async function generateFeedback() {
    setLoadingFeedback(true)
    try {
      setFeedback(await getRecommendation(plan._id))
    } catch (error) {
      toast.error(errorMessage(error, 'Could not generate a recommendation.'))
    } finally {
      setLoadingFeedback(false)
    }
  }

  const review = reviews.find((r) => r.weekLabel === activeWeek) ?? reviews[0]

  if (!review) {
    return (
      <div>
        <ReviewHeader weeks={[]} activeWeek={null} onChange={() => {}} />
        <p className="text-sm text-slate-500">Your first weekly review appears once your plan begins.</p>
      </div>
    )
  }

  return (
    <div>
      <ReviewHeader weeks={reviews.map((r) => r.weekLabel)} activeWeek={review.weekLabel} onChange={setActiveWeek} />

      <div className="space-y-4">
        <WeeklyMetrics review={review} />
        <CompletedTopics topics={review.completedTopics} />

        <div className="grid lg:grid-cols-2 gap-4">
          <StrongAreas items={review.strongAreas} />
          <WeakAreas items={review.weakAreas} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <TimeAnalysis analysis={review.timeAnalysis} />
          <DeviationAnalysis deviation={review.deviation} />
        </div>

        <AIFeedbackCard feedback={feedback} loading={loadingFeedback} onGenerate={generateFeedback} />
      </div>
    </div>
  )
}
