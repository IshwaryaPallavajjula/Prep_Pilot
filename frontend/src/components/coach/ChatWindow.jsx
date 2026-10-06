import { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400">Thinking…</div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
