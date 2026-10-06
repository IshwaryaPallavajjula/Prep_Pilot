import { useMemo } from 'react'
import ReadinessHero from '../../components/readiness/ReadinessHero'
import ReadinessBreakdown from '../../components/readiness/ReadinessBreakdown'
import ReadinessTrend from '../../components/readiness/ReadinessTrend'
import StrengthAreas from '../../components/readiness/StrengthAreas'
import RiskAreas from '../../components/readiness/RiskAreas'
import ReadinessExplanation from '../../components/readiness/ReadinessExplanation'
import { usePlan } from '../../hooks/usePlan'
import { buildReadinessHistory, buildStrengthAndRisk } from '../../utils/planSelectors'

export default function ReadinessPage() {
  const { plan, derived, todayKey } = usePlan()
  const { readiness, topics } = derived

  const history = useMemo(() => buildReadinessHistory(plan, todayKey), [plan, todayKey])
  const { strengths, risks } = useMemo(
    () => buildStrengthAndRisk(topics, readiness, todayKey, plan),
    [topics, readiness, todayKey, plan]
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-sans text-2xl font-semibold text-ink">Readiness</h2>
        <p className="mt-1 text-sm text-slate-500">A single score built from the work you have completed in your plan.</p>
      </div>

      <div className="space-y-4">
        <ReadinessHero overall={readiness.overall} />

        <div className="grid lg:grid-cols-2 gap-4">
          <ReadinessBreakdown breakdown={readiness} />
          <ReadinessTrend history={history} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <StrengthAreas items={strengths} />
          <RiskAreas items={risks} />
        </div>

        <ReadinessExplanation />
      </div>
    </div>
  )
}
