export default function AdaptivePlanningSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-sans text-2xl sm:text-3xl font-semibold text-ink">
            When your schedule changes, your plan changes with it.
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed max-w-md">
            Cut your daily availability from three hours to two, or miss a few days in a row —
            PrepPilot rebalances the remaining sessions instead of leaving you with a plan you can no
            longer follow.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white shadow-card p-5">
          <p className="text-xs font-medium text-slate-500 mb-3">Plan version history</p>
          <div className="space-y-3">
            {[
              ['Plan v1', 'Initial plan created'],
              ['Plan v2', 'Missed task 3 days in a row'],
              ['Plan v3', 'Reduced daily availability (3h → 2h)'],
            ].map(([label, reason], i) => (
              <div key={label} className="flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full ${i === 2 ? 'bg-runway-500' : 'bg-slate-300'}`} />
                <div>
                  <p className="text-sm font-medium text-ink">{label}</p>
                  <p className="text-xs text-slate-500">{reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
