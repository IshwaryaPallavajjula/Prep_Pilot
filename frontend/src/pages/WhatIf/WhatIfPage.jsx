import { useState } from 'react'
import ScenarioControls from '../../components/whatif/ScenarioControls'
import SimulationSummary from '../../components/whatif/SimulationSummary'
import BeforeAfterComparison from '../../components/whatif/BeforeAfterComparison'
import WorkloadChart from '../../components/whatif/WorkloadChart'
import RecoveryRecommendation from '../../components/whatif/RecoveryRecommendation'
import EmptyState from '../../components/common/EmptyState'
import { Sliders } from 'lucide-react'
import { runSimulation } from '../../services/simulationService'
import { usePlan } from '../../hooks/usePlan'
import { dateKey } from '../../utils/dates'

export default function WhatIfPage() {
  const { plan, goal, todayKey } = usePlan()
  const baselineHours = goal?.dailyStudyHours ?? 2

  const [scenario, setScenario] = useState({
    dailyHours: baselineHours,
    missedDays: 2,
    interviewDate: dateKey(goal?.interviewDate ?? plan.interviewDate),
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleRun() {
    setLoading(true)
    // Pure calculation over the real plan - no network involved
    setResult(runSimulation(scenario, { plan, goal, todayKey }))
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-sans text-2xl font-semibold text-ink">What-If Simulator</h2>
        <p className="mt-1 text-sm text-slate-500">
          Project how much of your plan you would finish by the interview under a different schedule.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <ScenarioControls scenario={scenario} onChange={(patch) => setScenario((s) => ({ ...s, ...patch }))} onRun={handleRun} loading={loading} />

        <div className="lg:col-span-2 space-y-4">
          {!result ? (
            <EmptyState
              icon={Sliders}
              title="Run a simulation to see the impact"
              description="Adjust daily study time, missed days, or your interview date, then run the simulation."
            />
          ) : (
            <>
              <SimulationSummary result={result} />
              <div className="grid sm:grid-cols-2 gap-4">
                <BeforeAfterComparison result={result} />
                <WorkloadChart dailyHours={scenario.dailyHours} baselineHours={baselineHours} />
              </div>
              <RecoveryRecommendation result={result} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
