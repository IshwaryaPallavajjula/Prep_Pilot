import { AlertTriangle } from 'lucide-react'
import Button from './Button'

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-signal-red">
        <AlertTriangle size={20} />
      </div>
      <p className="text-sm text-slate-600 max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
