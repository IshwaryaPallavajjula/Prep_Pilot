export default function DashboardHeader({ name }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = name.split(' ')[0]

  return (
    <div className="mb-6">
      <h2 className="font-sans text-2xl font-semibold text-ink">
        {greeting}, {firstName}
      </h2>
      <p className="mt-1 text-sm text-slate-500">Here's where your preparation stands today.</p>
    </div>
  )
}
