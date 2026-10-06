const express = require('express')
const weakAreaController = require('../controllers/weakAreaController')
const requireAuth = require('../middleware/auth')
const { requirePlanOwner } = require('../middleware/ownership')

const router = express.Router()

router.use(requireAuth)

router.get('/:planId', requirePlanOwner(), weakAreaController.getWeakAreas)

module.exports = router
