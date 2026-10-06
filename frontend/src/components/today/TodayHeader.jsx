import { ChevronLeft, ChevronRight } from 'lucide-react'
import Badge from '../common/Badge'
import { formatDay } from '../../utils/dates'

const RELATION_LABEL = {
  today: 'Today',
  upcoming: 'Upcoming session',
  finished: 'Plan finished',
  past: 'Earlier session',
  future: 'Upcoming session',
}

export default function TodayHeader({ date, dayNumber, totalDays, focus, relation, version, onPrev, onNext }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{formatDay(date, { weekday: true, long: true })}</p>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={!onPrev}
            aria-label="Previous plan day"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            onClick={onNext}
            disabled={!onNext}
            aria-label="Next plan day"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2">
        <h2 className="font-sans text-2xl font-semibold text-ink">{relation === 'today' ? "Today's Plan" : `Day ${dayNumber}`}</h2>
        <Badge tone="runway">{RELATION_LABEL[relation] ?? 'Session'}</Badge>
        <Badge tone="neutral">
          Day {dayNumber} of {totalDays} · Plan v{version}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-slate-500">Focus: {focus}</p>
    </div>
  )
}
