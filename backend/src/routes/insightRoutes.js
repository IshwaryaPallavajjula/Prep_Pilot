const express = require('express')
const insightController = require('../controllers/insightController')
const requireAuth = require('../middleware/auth')
const { requirePlanOwner } = require('../middleware/ownership')

const router = express.Router()

router.use(requireAuth)

router.get('/:planId', requirePlanOwner(), insightController.getInsights)

module.exports = router
