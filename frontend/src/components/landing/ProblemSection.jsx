const PROBLEMS = [
  {
    title: 'Plans that break the first missed day',
    body: 'A single skipped session and the neatly ordered spreadsheet plan no longer matches reality.',
  },
  {
    title: 'No signal on where you actually stand',
    body: 'Solving problems does not tell you whether you are ready for the interview date on your calendar.',
  },
  {
    title: 'One-size-fits-all prep',
    body: 'Generic roadmaps ignore your target companies, your current skill level, and how much time you actually have.',
  },
]

export default function ProblemSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200">
      <h2 className="font-sans text-2xl sm:text-3xl font-semibold text-ink max-w-xl">
        Most interview prep plans fall apart the moment life gets in the way.
      </h2>
      <div className="mt-10 grid sm:grid-cols-3 gap-8">
        {PROBLEMS.map((p) => (
          <div key={p.title}>
            <h3 className="font-medium text-ink">{p.title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
