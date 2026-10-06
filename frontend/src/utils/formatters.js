import { dateKey, diffDays, formatDay, formatTimestamp, todayKey } from './dates'

// Calendar days ("YYYY-MM-DD" or a stored midnight-UTC date) are formatted as
// calendar days; anything with a real time of day (createdAt) is a timestamp.
export function formatDate(date, options = {}) {
  if (!date) return '—'
  const isCalendarDay =
    typeof date === 'string' && /^\d{4}-\d{2}-\d{2}(T00:00:00(\.000)?Z)?$/.test(date)

  return isCalendarDay ? formatDay(date, options) : formatTimestamp(date, options)
}

export function formatDaysRemaining(targetDate) {
  const target = dateKey(targetDate)
  if (!target) return 0
  return Math.max(0, diffDays(todayKey(), target))
}

export function formatPercentage(value, digits = 0) {
  return `${Number(value).toFixed(digits)}%`
}

export function formatMinutesToHours(value) {
  const minutes = Math.round(Number(value) || 0)
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs === 0) return `${mins}m`
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

export function formatRelativeDay(dateString) {
  const key = dateKey(dateString)
  if (!key) return ''
  const diff = diffDays(todayKey(), key)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < 0) return `${Math.abs(diff)} days ago`
  return `in ${diff} days`
}

export function titleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function truncate(str, length = 80) {
  if (!str || str.length <= length) return str
  return `${str.slice(0, length).trim()}…`
}
