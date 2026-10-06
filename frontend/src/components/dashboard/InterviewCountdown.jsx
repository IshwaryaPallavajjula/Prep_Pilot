import { CalendarClock } from 'lucide-react'
import Card from '../common/Card'
import { formatDate } from '../../utils/formatters'

export default function InterviewCountdown({ daysRemaining, interviewDate, targetCompanies = [] }) {
  const companies = targetCompanies.length ? ` · ${targetCompanies.join(', ')}` : ''

  return (
    <Card className="bg-ink text-white border-ink">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/60">Interview in</p>
          <p className="text-3xl font-semibold font-sans mt-1">
            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
          </p>
          <p className="mt-1.5 text-sm text-white/70">
            {formatDate(interviewDate, { year: true })}
            {companies}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/10 text-white">
          <CalendarClock size={20} />
        </div>
      </div>
    </Card>
  )
}
