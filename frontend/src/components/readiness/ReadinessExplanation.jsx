import Card from '../common/Card'

export default function ReadinessExplanation() {
  return (
    <Card className="bg-slate-50 border-slate-200">
      <p className="text-xs font-medium text-slate-500 mb-2">How readiness is calculated</p>
      <p className="text-sm text-slate-600 leading-relaxed">
        Your overall score weighs DSA (35%), CS Fundamentals (20%), System Design (20%), consistency (10%),
        revision coverage (8%), and mock interview performance (7%). Each area is the share of its planned tasks
        you have completed (partial tasks count half). Areas your plan does not include are left out of the average. It updates
        every time you update a task — it does not guarantee interview performance.
      </p>
    </Card>
  )
}
