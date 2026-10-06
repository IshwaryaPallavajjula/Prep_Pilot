import { useMemo, useState } from 'react'
import MasterySummary from '../../components/mastery/MasterySummary'
import MasteryFilters from '../../components/mastery/MasteryFilters'
import TopicMasteryCard from '../../components/mastery/TopicMasteryCard'
import TopicDetailPanel from '../../components/mastery/TopicDetailPanel'
import EmptyState from '../../components/common/EmptyState'
import { Target } from 'lucide-react'
import { usePlan } from '../../hooks/usePlan'

export default function MasteryPage() {
  const { derived } = usePlan()
  const masteryTopics = derived.topics
  const [filter, setFilter] = useState('All')
  const [selectedTopic, setSelectedTopic] = useState(masteryTopics[0]?.topic ?? null)

  const filteredTopics = useMemo(() => {
    if (filter === 'All') return masteryTopics
    if (filter === 'Needs revision') return masteryTopics.filter((t) => t.revisionNeeded)
    return masteryTopics.filter((t) => t.priority === filter)
  }, [masteryTopics, filter])

  const selected = masteryTopics.find((t) => t.topic === selectedTopic) ?? filteredTopics[0]

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-sans text-2xl font-semibold text-ink">Topic Mastery</h2>
        <p className="mt-1 text-sm text-slate-500">
          How much of each topic in your plan you have completed. Mastery grows as you finish its tasks.
        </p>
      </div>

      {masteryTopics.length === 0 ? (
        <EmptyState icon={Target} title="No topics yet" description="Topics appear once your plan has sessions." />
      ) : (
        <>
          <div className="mb-4">
            <MasterySummary topics={masteryTopics} />
          </div>

          <MasteryFilters active={filter} onChange={setFilter} />

          {filteredTopics.length === 0 ? (
            <EmptyState icon={Target} title="Nothing here" description="No topics match this filter right now." />
          ) : (
            <div className="grid lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3 grid sm:grid-cols-2 gap-3 content-start">
                {filteredTopics.map((topic) => (
                  <TopicMasteryCard key={topic.topic} topic={topic} selected={selected?.topic === topic.topic} onSelect={(t) => setSelectedTopic(t.topic)} />
                ))}
              </div>
              <div className="lg:col-span-2">
                <TopicDetailPanel topic={selected} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
