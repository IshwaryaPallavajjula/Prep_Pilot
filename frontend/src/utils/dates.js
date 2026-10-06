// Calendar-day helpers.
//
// The backend stores every "date" (interview date, plan day) as midnight UTC of
// a calendar day. To avoid the classic off-by-one, the frontend NEVER runs those
// values through the browser's local timezone:
//   * it sends calendar days as "YYYY-MM-DD"
//   * it reads them back with dateKey() (the UTC calendar day)
//   * it formats them with timeZone: 'UTC'
// "Today" is the user's own local calendar day (todayKey()).

const pad = (n) => String(n).padStart(2, '0')

// The user's local calendar day, "YYYY-MM-DD"
export function todayKey(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// Stored date (ISO string / Date / "YYYY-MM-DD") -> "YYYY-MM-DD"
export function dateKey(value) {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function keyToDate(key) {
  return new Date(`${key}T00:00:00.000Z`)
}

export function addDaysToKey(key, days) {
  const d = keyToDate(key)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function diffDays(fromKey, toKey) {
  return Math.round((keyToDate(toKey).getTime() - keyToDate(fromKey).getTime()) / 86400000)
}

export function weekdayShort(key) {
  return keyToDate(key).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
}

// Format a calendar day, e.g. "Oct 29" / "Oct 29, 2026" / "Thursday, October 29"
export function formatDay(value, options = {}) {
  const key = dateKey(value)
  if (!key) return '—'

  const { year = false, weekday = false, long = false } = options

  return keyToDate(key).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: weekday ? (long ? 'long' : 'short') : undefined,
    month: long ? 'long' : 'short',
    day: 'numeric',
    year: year ? 'numeric' : undefined,
  })
}

// Format a real moment in time (createdAt etc.) in the user's timezone
export function formatTimestamp(value, options = {}) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: options.year ? 'numeric' : undefined,
  })
}
