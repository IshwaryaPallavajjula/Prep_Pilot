import { PLAN_CATEGORIES } from '../../utils/constants'
import Tabs from '../common/Tabs'

export default function PlanFilters({ active, onChange }) {
  return (
    <Tabs
      tabs={PLAN_CATEGORIES.map((c) => ({ label: c, value: c }))}
      active={active}
      onChange={onChange}
      className="mb-5 overflow-x-auto"
    />
  )
}
