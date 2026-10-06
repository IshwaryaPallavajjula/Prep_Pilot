import Tabs from '../common/Tabs'

const FILTERS = ['All', 'HIGH', 'MEDIUM', 'LOW', 'Needs revision']

export default function MasteryFilters({ active, onChange }) {
  return (
    <Tabs
      tabs={FILTERS.map((f) => ({ label: f === 'HIGH' ? 'High priority' : f === 'MEDIUM' ? 'Medium priority' : f === 'LOW' ? 'Low priority' : f, value: f }))}
      active={active}
      onChange={onChange}
      className="mb-5 overflow-x-auto"
    />
  )
}
