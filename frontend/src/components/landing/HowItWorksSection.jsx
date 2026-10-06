const STEPS = [
  {
    title: 'Tell us your goal',
    body: 'Target role, companies, interview date, and how much time you realistically have each day.',
  },
  {
    title: 'Get a plan built around it',
    body: 'A day-by-day rotation across DSA, CS fundamentals, and System Design, sized to your timeline.',
  },
  {
    title: 'Work the plan',
    body: 'Mark tasks complete, partial, or skipped. Every session feeds back into your progress and mastery.',
  },
  {
    title: 'Watch it adapt',
    body: 'Miss a few days or change your availability, and the plan rebalances itself instead of falling apart.',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200">
      <h2 className="font-sans text-2xl sm:text-3xl font-semibold text-ink">How it works</h2>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {STEPS.map((step, i) => (
          <div key={step.title} className="border-l-2 border-runway-200 pl-4">
            <p className="text-sm text-runway-600 font-medium mb-1.5">Step {i + 1}</p>
            <h3 className="font-medium text-ink">{step.title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
