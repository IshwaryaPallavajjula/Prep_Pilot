import { SKILL_LEVELS, TOPICS } from '../../utils/constants'

function LevelPicker({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-ink">{label}</span>
      <div className="flex gap-1">
        {SKILL_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            title={level}
            className={`h-2.5 w-7 rounded-full transition-colors ${
              SKILL_LEVELS.indexOf(value) >= SKILL_LEVELS.indexOf(level) ? 'bg-runway-500' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function SkillAssessmentStep({ data, onChange }) {
  const topics = data.topics || {}

  function setTopicLevel(topic, level) {
    onChange({ topics: { ...topics, [topic]: level } })
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-x-6">
        <LevelPicker label="DSA" value={data.dsa || 'Beginner'} onChange={(v) => onChange({ dsa: v })} />
        <LevelPicker
          label="CS Fundamentals"
          value={data.csFundamentals || 'Beginner'}
          onChange={(v) => onChange({ csFundamentals: v })}
        />
        <LevelPicker
          label="System Design"
          value={data.systemDesign || 'Beginner'}
          onChange={(v) => onChange({ systemDesign: v })}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-ink mb-1">Topic-level self assessment</p>
        <p className="text-xs text-slate-500 mb-2">Tap a bar to set your current confidence for each topic.</p>
        <div className="divide-y divide-slate-100">
          {TOPICS.map((topic) => (
            <LevelPicker
              key={topic}
              label={topic}
              value={topics[topic] || 'Beginner'}
              onChange={(v) => setTopicLevel(topic, v)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
