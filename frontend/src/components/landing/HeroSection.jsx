import { Link } from 'react-router-dom'
import { ArrowRight, PlayCircle } from 'lucide-react'
import Button from '../common/Button'

export default function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-14 items-center">
      <div>
        <p className="text-sm font-medium text-runway-600 mb-4">SDE interview preparation</p>
        <h1 className="font-sans text-4xl sm:text-5xl font-semibold text-ink leading-[1.08] tracking-tight">
          Your preparation plan that adapts with you.
        </h1>
        <p className="mt-5 text-lg text-slate-600 max-w-lg leading-relaxed">
          Build a personalized SDE interview preparation plan, track your execution, and let it
          automatically adjust when your schedule changes — instead of starting over every time life gets busy.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="/signup">
            <Button size="lg" icon={ArrowRight}>
              Start Preparing
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="lg" variant="secondary" icon={PlayCircle}>
              See How It Works
            </Button>
          </a>
        </div>
      </div>

      <div className="relative">
        <div className="rounded-lg border border-slate-200 bg-white shadow-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-runway-600 text-white text-[10px] font-bold">
              PP
            </div>
            <span className="text-sm font-medium text-ink">Dashboard</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between rounded-md bg-runway-50 px-4 py-3">
              <div>
                <p className="text-xs text-runway-700">Interview in</p>
                <p className="text-lg font-semibold text-runway-800">42 days</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-runway-700">Readiness</p>
                <p className="text-lg font-semibold text-runway-800">67%</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['DSA', '74%'],
                ['CS', '81%'],
                ['System Design', '48%'],
              ].map(([label, val]) => (
                <div key={label} className="rounded-md border border-slate-100 px-3 py-2.5">
                  <p className="text-[11px] text-slate-500">{label}</p>
                  <p className="text-sm font-semibold text-ink">{val}</p>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500 mb-1">Today's focus</p>
              <p className="text-sm font-medium text-ink">Dynamic Programming</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                <div className="h-full w-1/3 rounded-full bg-runway-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
