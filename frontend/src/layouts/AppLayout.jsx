import { useState } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import MobileNavigation from '../components/layout/MobileNavigation'
import MobileDrawer from '../components/layout/MobileDrawer'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import Button from '../components/common/Button'
import { primaryNavItems } from '../data/navigation'
import { useAuth } from '../hooks/useAuth'
import { usePlan } from '../hooks/usePlan'

function pageTitle(pathname) {
  const match = primaryNavItems.find((item) => pathname.startsWith(item.path))
  if (match) return match.label
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'PrepPilot'
}

function FullPage({ children }) {
  return <div className="min-h-screen bg-paper flex items-center justify-center px-4">{children}</div>
}

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, authReady, logout } = useAuth()
  const { loading, status, error, plan, refresh } = usePlan()

  if (!authReady) {
    return (
      <FullPage>
        <LoadingState label="Checking your session…" />
      </FullPage>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return (
      <FullPage>
        <LoadingState label="Loading your plan…" />
      </FullPage>
    )
  }

  if (status === 'error' && !plan) {
    return (
      <FullPage>
        <div className="flex flex-col items-center">
          <ErrorState message={error} onRetry={() => refresh()} />
          <Button variant="ghost" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </FullPage>
    )
  }

  // No plan yet -> the account still has to finish onboarding
  if (!plan) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="flex-1 min-w-0 pb-16 lg:pb-0">
        <Header onMenuClick={() => setDrawerOpen(true)} title={pageTitle(location.pathname)} />
        <main className="px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileNavigation />
    </div>
  )
}
