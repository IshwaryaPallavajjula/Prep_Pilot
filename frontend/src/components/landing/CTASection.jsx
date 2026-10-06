import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '../common/Button'

export default function CTASection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-200">
      <div className="rounded-lg bg-ink px-8 py-14 text-center">
        <h2 className="font-sans text-2xl sm:text-3xl font-semibold text-white max-w-lg mx-auto">
          Start building a plan that holds up past week one.
        </h2>
        <div className="mt-7">
          <Link to="/signup">
            <Button size="lg" icon={ArrowRight}>
              Start Preparing
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
