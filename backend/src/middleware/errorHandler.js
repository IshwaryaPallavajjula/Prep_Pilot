// Central error handler. Turns database / auth / parsing failures into clean
// { success:false, message } responses with a sensible HTTP status.
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500
  let message = err.message || 'Internal server error'

  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ')
  } else if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid value for ${err.path}`
  } else if (err.code === 11000) {
    statusCode = 409
    message = 'A record with these details already exists'
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400
    message = 'Request body is not valid JSON'
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Invalid or expired session. Please log in again.'
  } else if (err.name === 'VersionError') {
    statusCode = 409
    message = 'This plan was just updated somewhere else. Please retry.'
  }

  if (statusCode >= 500) {
    console.error(err.stack || err)
    if (!err.statusCode) message = 'Something went wrong on the server. Please try again.'
  }

  res.status(statusCode).json({
    success: false,
    message,
  })
}

module.exports = errorHandler
