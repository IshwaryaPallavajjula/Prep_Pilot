const { resolveToday } = require('../utils/dates')

// Reads the client's local calendar day ("YYYY-MM-DD") from the X-Client-Date
// header so "today" is always the user's today, not the server's.
function clientDate(req, res, next) {
  req.clientToday = resolveToday(req.get('X-Client-Date'))
  next()
}

module.exports = clientDate
