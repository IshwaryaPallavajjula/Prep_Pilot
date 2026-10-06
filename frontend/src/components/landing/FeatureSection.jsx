import { Target, MessageCircle, Gauge, Sliders } from 'lucide-react'

const FEATURES = [
  {
    icon: Target,
    title: 'Topic mastery tracking',
    body: 'Confidence and mastery scores per topic, so you know exactly what still needs work before the interview.',
  },
  {
    icon: MessageCircle,
    title: 'AI coach, grounded in your data',
    body: 'Ask what to do today, what to revise, or why your plan changed — answered against your actual progress.',
  },
  {
    icon: Gauge,
    title: 'A readiness score you can trust',
    body: 'A single number built from your DSA, CS, System Design, consistency, and mock interview performance.',
  },
  {
    icon: Sliders,
    title: 'What-if simulation',
    body: 'Model a lighter week or a pushed-back interview date before you commit to changing your plan.',
  },
]

export default function FeatureSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200">
      <h2 className="font-sans text-2xl sm:text-3xl font-semibold text-ink">Built for how prep actually goes</h2>
      <div className="mt-10 grid sm:grid-cols-2 gap-8">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-runway-50 text-runway-600">
              <f.icon size={18} />
            </div>
            <div>
              <h3 className="font-medium text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{f.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
