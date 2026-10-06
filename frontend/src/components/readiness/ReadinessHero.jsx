import Card from '../common/Card'
import ProgressRing from '../common/ProgressRing'

export default function ReadinessHero({ overall }) {
  return (
    <Card className="flex flex-col sm:flex-row items-center gap-6 bg-ink text-white border-ink">
      <ProgressRing value={overall} size={120} strokeWidth={10} tone="#8CA4FF" label={`${overall}%`} />
      <div className="text-center sm:text-left">
        <p className="text-sm text-white/60">Overall readiness</p>
        <p className="mt-1 text-2xl font-semibold font-sans">
          {overall >= 70 ? 'On track' : overall >= 50 ? 'Building steadily' : 'Needs a push'}
        </p>
        <p className="mt-2 text-sm text-white/70 max-w-md">
          Readiness is an estimate based on preparation data and does not guarantee interview performance.
        </p>
      </div>
    </Card>
  )
}
