import { Link } from 'react-router-dom'
import HeroSection from '../../components/landing/HeroSection'
import ProblemSection from '../../components/landing/ProblemSection'
import HowItWorksSection from '../../components/landing/HowItWorksSection'
import FeatureSection from '../../components/landing/FeatureSection'
import AdaptivePlanningSection from '../../components/landing/AdaptivePlanningSection'
import CTASection from '../../components/landing/CTASection'
import Footer from '../../components/landing/Footer'
import Button from '../../components/common/Button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-runway-600 text-white text-xs font-bold">
              PP
            </div>
            <span className="font-sans font-semibold text-ink">PrepPilot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Start Preparing</Button>
            </Link>
          </div>
        </div>
      </header>

      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeatureSection />
      <AdaptivePlanningSection />
      <CTASection />
      <Footer />
    </div>
  )
}
