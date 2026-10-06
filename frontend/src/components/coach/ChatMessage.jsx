export default function ChatMessage({ message }) {
  const isAssistant = message.role === 'assistant'
  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] sm:max-w-md whitespace-pre-wrap break-words rounded-lg px-4 py-3 text-sm leading-relaxed ${
          message.error
            ? 'bg-red-50 border border-red-100 text-signal-red'
            : isAssistant
            ? 'bg-white border border-slate-200 text-ink'
            : 'bg-runway-600 text-white'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
