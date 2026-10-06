const express = require('express')
const coachController = require('../controllers/coachController')
const requireAuth = require('../middleware/auth')
const { requirePlanOwner } = require('../middleware/ownership')

const router = express.Router()

router.use(requireAuth)

router.post('/:planId/chat', requirePlanOwner(), coachController.chat)

module.exports = router
