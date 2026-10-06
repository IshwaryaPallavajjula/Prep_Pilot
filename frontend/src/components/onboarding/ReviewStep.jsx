import { formatDay } from '../../utils/dates'

export default function ReviewStep({ data }) {
  const rows = [
    ['Target role', data.targetRole || '—'],
    ['Target companies', (data.targetCompanies || []).join(', ') || '—'],
    ['Interview date', data.interviewDate ? formatDay(data.interviewDate, { year: true }) : '—'],
    ['Daily availability', data.dailyHours || '—'],
    ['Study days', (data.studyDays || []).join(', ') || '—'],
    ['DSA level', data.dsa || '—'],
    ['CS Fundamentals level', data.csFundamentals || '—'],
    ['System Design level', data.systemDesign || '—'],
    ['Difficulty preference', data.difficulty || '—'],
    ['Session style', data.sessionStyle || '—'],
    ['Mock interviews', data.mockInterviews ? 'Included' : 'Not included'],
    ['Weekend intensity', data.weekendIntensity || '—'],
  ]

  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">
        Here's your complete profile. PrepPilot will use this to build your first plan.
      </p>
      <div className="rounded-md border border-slate-200 divide-y divide-slate-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-ink text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
