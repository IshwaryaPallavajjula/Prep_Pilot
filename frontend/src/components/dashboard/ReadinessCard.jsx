import { Link } from 'react-router-dom'
import Card from '../common/Card'
import ProgressRing from '../common/ProgressRing'

export default function ReadinessCard({ overall }) {
  return (
    <Card className="flex items-center gap-4">
      <ProgressRing value={overall} size={72} strokeWidth={7} />
      <div>
        <p className="text-sm text-slate-500">Overall readiness</p>
        <Link to="/readiness" className="text-sm font-medium text-runway-600 hover:underline">
          View breakdown
        </Link>
      </div>
    </Card>
  )
}
