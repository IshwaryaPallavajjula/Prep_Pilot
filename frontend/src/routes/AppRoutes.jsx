import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'

import LandingPage from '../pages/Landing/LandingPage'
import LoginPage from '../pages/Auth/LoginPage'
import SignupPage from '../pages/Auth/SignupPage'
import OnboardingPage from '../pages/Onboarding/OnboardingPage'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import TodayPage from '../pages/Today/TodayPage'
import PlanPage from '../pages/Plan/PlanPage'
import ProgressPage from '../pages/Progress/ProgressPage'
import MasteryPage from '../pages/Mastery/MasteryPage'
import CoachPage from '../pages/Coach/CoachPage'
import ReviewsPage from '../pages/Reviews/ReviewsPage'
import ReadinessPage from '../pages/Readiness/ReadinessPage'
import WhatIfPage from '../pages/WhatIf/WhatIfPage'
import SettingsPage from '../pages/Settings/SettingsPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route path="/onboarding" element={<OnboardingPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/mastery" element={<MasteryPage />} />
        <Route path="/coach" element={<CoachPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/readiness" element={<ReadinessPage />} />
        <Route path="/what-if" element={<WhatIfPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
