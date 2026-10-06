import { useEffect, useMemo, useState } from 'react'
import PlanHeader from '../../components/plan/PlanHeader'
import PlanFilters from '../../components/plan/PlanFilters'
import PlanTimeline from '../../components/plan/PlanTimeline'
import PlanVersionHistory from '../../components/plan/PlanVersionHistory'
import PlanComparison from '../../components/plan/PlanComparison'
import AdaptationPanel from '../../components/dashboard/AdaptationPanel'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import Tabs from '../../components/common/Tabs'
import { usePlan } from '../../hooks/usePlan'
import { daySummary, getDays } from '../../utils/planSelectors'

export default function PlanPage() {
  const { plan, derived, todayKey, versions, versionsError, loadVersions } = usePlan()
  const [filter, setFilter] = useState('All')
  const [view, setView] = useState('timeline')

  useEffect(() => {
    if (view === 'history' && !versions && !versionsError) loadVersions()
  }, [view, versions, versionsError, loadVersions])

  const days = useMemo(() => getDays(plan).map(daySummary), [plan])
  const filteredDays = useMemo(() => (filter === 'All' ? days : days.filter((d) => d.category === filter)), [days, filter])

  return (
    <div>
      <PlanHeader plan={plan} totals={derived.totals} />

      <Tabs
        tabs={[
          { label: 'Timeline', value: 'timeline' },
          { label: 'Version history', value: 'history' },
        ]}
        active={view}
        onChange={setView}
        className="mb-5"
      />

      {view === 'timeline' ? (
        <>
          <PlanFilters active={filter} onChange={setFilter} />
          <PlanTimeline days={filteredDays} todayKey={todayKey} />
        </>
      ) : (
        <div className="space-y-4">
          <AdaptationPanel />
          {versionsError ? (
            <ErrorState message={versionsError} onRetry={loadVersions} />
          ) : !versions ? (
            <LoadingState label="Loading plan versions…" />
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              <PlanVersionHistory versions={versions} />
              <PlanComparison versions={versions} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
