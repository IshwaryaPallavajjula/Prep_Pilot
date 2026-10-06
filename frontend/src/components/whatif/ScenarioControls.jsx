import Card from '../common/Card'
import DatePicker from '../common/DatePicker'
import Button from '../common/Button'
import { Sliders } from 'lucide-react'

export default function ScenarioControls({ scenario, onChange, onRun, loading }) {
  return (
    <Card>
      <p className="text-xs text-slate-500 mb-4">Adjust the scenario</p>

      <div className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-ink">Daily study time: {scenario.dailyHours}h</span>
          <input
            type="range"
            min={0.5}
            max={6}
            step={0.5}
            value={scenario.dailyHours}
            onChange={(e) => onChange({ dailyHours: Number(e.target.value) })}
            className="w-full mt-2 accent-runway-600"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Missed days: {scenario.missedDays}</span>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={scenario.missedDays}
            onChange={(e) => onChange({ missedDays: Number(e.target.value) })}
            className="w-full mt-2 accent-runway-600"
          />
        </label>

        <DatePicker
          label="Interview date"
          value={scenario.interviewDate}
          onChange={(value) => onChange({ interviewDate: value })}
        />
      </div>

      <Button icon={Sliders} className="w-full mt-6" onClick={onRun} loading={loading}>
        Run simulation
      </Button>
    </Card>
  )
}
