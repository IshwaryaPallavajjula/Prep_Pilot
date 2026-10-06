import { ROLES, COMPANIES } from '../../utils/constants'
import DatePicker from '../common/DatePicker'
import { todayKey } from '../../utils/dates'

export default function GoalStep({ data, onChange }) {
  function toggleCompany(company) {
    const current = data.targetCompanies || []
    const next = current.includes(company)
      ? current.filter((c) => c !== company)
      : [...current, company]
    onChange({ targetCompanies: next })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-ink mb-2">Target role</p>
        <div className="flex gap-2">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => onChange({ targetRole: role })}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                data.targetRole === role
                  ? 'bg-runway-600 border-runway-600 text-white'
                  : 'border-slate-200 text-ink hover:border-slate-300'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink mb-2">Target companies</p>
        <div className="flex flex-wrap gap-2">
          {COMPANIES.map((company) => (
            <button
              key={company}
              type="button"
              onClick={() => toggleCompany(company)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                (data.targetCompanies || []).includes(company)
                  ? 'bg-runway-50 border-runway-300 text-runway-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {company}
            </button>
          ))}
        </div>
      </div>

      <DatePicker
        label="Interview date"
        value={data.interviewDate || ''}
        min={todayKey()}
        onChange={(value) => onChange({ interviewDate: value })}
        className="max-w-xs"
      />
    </div>
  )
}
