import { Outlet, Link } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="px-6 py-5">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-runway-600 text-white text-xs font-bold">
            PP
          </div>
          <span className="font-sans font-semibold text-ink">PrepPilot</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <Outlet />
      </div>
    </div>
  )
}
