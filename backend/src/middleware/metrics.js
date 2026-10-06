const {
  httpRequestDuration,
  httpRequestTotal,
} = require('../config/metrics')

function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint()

  res.on('finish', () => {
    const end = process.hrtime.bigint()

    const duration =
      Number(end - start) / 1_000_000_000

    const route =
      req.route?.path || req.path

    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode,
    }

    httpRequestDuration.observe(labels, duration)
    httpRequestTotal.inc(labels)
  })

  next()
}

module.exports = metricsMiddleware