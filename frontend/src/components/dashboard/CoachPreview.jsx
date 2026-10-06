import { Link } from 'react-router-dom'
import { MessageCircle, ArrowRight } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'

export default function CoachPreview({ focus }) {
  return (
    <Card className="bg-runway-50 border-runway-100">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-runway-600">
          <MessageCircle size={17} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">Ask your AI coach</p>
          <p className="mt-1 text-sm text-slate-600">
            {focus
              ? `Stuck on “${focus}”? Your coach can explain it, quiz you, or suggest what to do next.`
              : 'Your coach can explain concepts, quiz you, or suggest what to do next.'}
          </p>
          <Link to="/coach" className="inline-block mt-3">
            <Button variant="secondary" size="sm" icon={ArrowRight}>
              Open coach
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
