import { useState } from 'react'
import ChatWindow from '../../components/coach/ChatWindow'
import ChatInput from '../../components/coach/ChatInput'
import QuickQuestions from '../../components/coach/QuickQuestions'
import CoachContextPanel from '../../components/coach/CoachContextPanel'
import { sendMessage } from '../../services/coachService'
import { errorMessage } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { useToast } from '../../context/ToastContext'

const QUICK_QUESTIONS = [
  'What should I do today?',
  'Am I on track?',
  'What should I revise?',
  'Explain my current focus topic',
  'Give me a practice question',
]

export default function CoachPage() {
  const { user } = useAuth()
  const { plan, derived } = usePlan()
  const toast = useToast()

  const [messages, setMessages] = useState(() => [
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hi ${user.name.split(' ')[0]}, I'm your prep coach. I can see your goal, your current plan and how your tasks are going. Ask me anything, or try one of the quick questions below.`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [loading, setLoading] = useState(false)

  async function handleSend(text) {
    const userMessage = { id: `msg_${Date.now()}_u`, role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const reply = await sendMessage(plan._id, text)
      setMessages((prev) => [...prev, reply])
    } catch (error) {
      const message = errorMessage(error, 'The coach could not answer right now.')
      toast.error(message)
      setMessages((prev) => [
        ...prev,
        { id: `msg_${Date.now()}_e`, role: 'assistant', error: true, content: `${message} Please try again.`, timestamp: new Date().toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-6.5rem)]">
      <div className="mb-4">
        <h2 className="font-sans text-2xl font-semibold text-ink">AI Coach</h2>
        <p className="mt-1 text-sm text-slate-500">Your preparation-aware guide — grounded in your plan and progress.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <ChatWindow messages={messages} loading={loading} />
          <div className="pt-3 mt-3 border-t border-slate-200">
            <QuickQuestions questions={QUICK_QUESTIONS} onSelect={handleSend} disabled={loading} />
            <ChatInput onSend={handleSend} disabled={loading} />
          </div>
        </div>
        <CoachContextPanel
          readiness={derived.readiness}
          completion={derived.totals.completion}
          version={plan.version}
          topFocus={derived.current.day?.focus ?? '—'}
        />
      </div>
    </div>
  )
}
