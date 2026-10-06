export default function QuickQuestions({ questions, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {questions.map((q) => (
        <button
          key={q}
          disabled={disabled}
          onClick={() => onSelect(q)}
          className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:border-runway-300 hover:text-runway-700 disabled:opacity-50 transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
