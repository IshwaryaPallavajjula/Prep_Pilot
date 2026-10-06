// -----------------------------------------------------------------------------
// Date strategy (used everywhere in the backend)
//
// PrepPilot only cares about CALENDAR DAYS (interview date, plan day date), not
// instants in time. To avoid the classic "date shifted by one day" bug:
//
//   * A calendar day is stored in MongoDB as midnight UTC of that day.
//   * The client always sends calendar days as "YYYY-MM-DD" strings.
//   * The client tells the server what "today" is (its own local calendar day)
//     via the `X-Client-Date` header, so server timezone never matters.
//   * All arithmetic here is done in UTC so DST / server timezone can't shift it.
//   * The frontend formats stored dates using their UTC calendar day as well.
// -----------------------------------------------------------------------------

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function isDateKey(value) {
  if (typeof value !== 'string' || !DATE_KEY_RE.test(value)) return false
  const d = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

// Any Date / ISO string / "YYYY-MM-DD"  ->  "YYYY-MM-DD" (UTC calendar day)
function toDateKey(value) {
  if (typeof value === 'string' && isDateKey(value)) return value
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

// Any accepted date input -> Date at midnight UTC of that calendar day
function parseDateOnly(value) {
  const key = toDateKey(value)
  return key ? new Date(`${key}T00:00:00.000Z`) : null
}

function addDaysToKey(key, days) {
  const d = new Date(`${key}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function diffDaysBetweenKeys(fromKey, toKey) {
  const a = new Date(`${fromKey}T00:00:00.000Z`).getTime()
  const b = new Date(`${toKey}T00:00:00.000Z`).getTime()
  return Math.round((b - a) / 86400000)
}

function weekdayLabel(key) {
  return WEEKDAY_LABELS[new Date(`${key}T00:00:00.000Z`).getUTCDay()]
}

// The client's "today" if it sent a valid one, otherwise today in UTC.
function resolveToday(clientDate) {
  return isDateKey(clientDate) ? clientDate : new Date().toISOString().slice(0, 10)
}

// Calendar days from startKey up to (and including) endKey on which the user
// studies. `studyDays` uses labels like ['Mon','Tue']; empty = every day.
function buildStudyDateKeys(startKey, endKey, studyDays = [], maxCount = Infinity) {
  const allowed = Array.isArray(studyDays) && studyDays.length ? new Set(studyDays) : null
  const keys = []
  let cursor = startKey
  let guard = 0

  while (cursor <= endKey && keys.length < maxCount && guard < 800) {
    if (!allowed || allowed.has(weekdayLabel(cursor))) keys.push(cursor)
    cursor = addDaysToKey(cursor, 1)
    guard += 1
  }

  return keys
}

module.exports = {
  isDateKey,
  toDateKey,
  parseDateOnly,
  addDaysToKey,
  diffDaysBetweenKeys,
  weekdayLabel,
  resolveToday,
  buildStudyDateKeys,
}
