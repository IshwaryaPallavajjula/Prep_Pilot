const express = require('express')
const { getUser, updateUser } = require('../controllers/userController')
const requireAuth = require('../middleware/auth')
const { requireSelfParam } = require('../middleware/ownership')

const router = express.Router()

// Accounts are created via POST /api/auth/signup and removed via
// DELETE /api/auth/me. These routes only expose the caller's own profile.
router.use(requireAuth)

router.get('/:id', requireSelfParam('id'), getUser)
router.put('/:id', requireSelfParam('id'), updateUser)

module.exports = router
