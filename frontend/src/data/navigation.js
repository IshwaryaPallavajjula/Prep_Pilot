import {
  LayoutDashboard,
  CalendarCheck,
  Map,
  TrendingUp,
  Target,
  MessageCircle,
  ClipboardList,
  Gauge,
  Sliders,
} from 'lucide-react'

export const primaryNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: "Today's Plan", path: '/today', icon: CalendarCheck },
  { label: 'My Plan', path: '/plan', icon: Map },
  { label: 'Progress', path: '/progress', icon: TrendingUp },
  { label: 'Topic Mastery', path: '/mastery', icon: Target },
  { label: 'AI Coach', path: '/coach', icon: MessageCircle },
  { label: 'Weekly Reviews', path: '/reviews', icon: ClipboardList },
  { label: 'Readiness', path: '/readiness', icon: Gauge },
  { label: 'What-If Simulator', path: '/what-if', icon: Sliders },
]

export const mobileNavItems = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Today', path: '/today', icon: CalendarCheck },
  { label: 'Plan', path: '/plan', icon: Map },
  { label: 'Coach', path: '/coach', icon: MessageCircle },
  { label: 'Readiness', path: '/readiness', icon: Gauge },
]
