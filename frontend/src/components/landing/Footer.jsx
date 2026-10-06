export default function Footer() {
  return (
    <footer className="border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-runway-600 text-white text-[10px] font-bold">
            PP
          </div>
          <span className="font-medium text-ink">PrepPilot</span>
        </div>
        <p>&copy; {new Date().getFullYear()} PrepPilot. Built for SDE interview preparation.</p>
      </div>
    </footer>
  )
}
