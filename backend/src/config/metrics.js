const client = require('prom-client')

const register = new client.Registry()

client.collectDefaultMetrics({
  register,
})

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [
    0.01,
    0.025,
    0.05,
    0.1,
    0.2,
    0.5,
    1,
    2,
  ],
})

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
})

register.registerMetric(httpRequestDuration)
register.registerMetric(httpRequestTotal)

module.exports = {
  client,
  register,
  httpRequestDuration,
  httpRequestTotal,
}