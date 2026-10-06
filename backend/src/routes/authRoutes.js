const express = require('express')
const authController = require('../controllers/authController')
const requireAuth = require('../middleware/auth')

const router = express.Router()

// Public
router.post('/signup', authController.signup)
router.post('/login', authController.login)

// Authenticated
router.get('/me', requireAuth, authController.me)
router.patch('/me', requireAuth, authController.updateMe)
router.put('/me', requireAuth, authController.updateMe)
router.put('/password', requireAuth, authController.changePassword)
router.post('/logout', requireAuth, authController.logout)
router.delete('/me', requireAuth, authController.deleteMe)

module.exports = router
