import { useState } from 'react'
import { Send } from 'lucide-react'

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    onSend(value.trim())
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask your coach anything about your plan…"
        disabled={disabled}
        className="flex-1 rounded-md border border-slate-200 px-4 py-2.5 text-sm focus-visible:focus-ring disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex h-10 w-10 items-center justify-center rounded-md bg-runway-600 text-white disabled:bg-runway-300 focus-visible:focus-ring"
        aria-label="Send message"
      >
        <Send size={16} />
      </button>
    </form>
  )
}
