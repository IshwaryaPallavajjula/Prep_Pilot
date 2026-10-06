const DEV_FALLBACK_SECRET = 'preppilot-dev-only-secret-change-me'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (secret) return secret

  if (process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET is not set. Refusing to start in production without it.')
    process.exit(1)
  }

  if (!getJwtSecret.warned) {
    console.warn(
      '[auth] JWT_SECRET is not set - using an insecure development secret. ' +
        'Add JWT_SECRET to backend/.env before deploying.'
    )
    getJwtSecret.warned = true
  }

  return DEV_FALLBACK_SECRET
}

module.exports = {
  getJwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: 10,
}
