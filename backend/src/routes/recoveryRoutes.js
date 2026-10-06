const express = require('express')
const recoveryController = require('../controllers/recoveryController')
const requireAuth = require('../middleware/auth')
const { requirePlanOwner } = require('../middleware/ownership')

const router = express.Router()

router.use(requireAuth)

// Analyze unfinished work and deviation
router.get('/:planId/analyze', requirePlanOwner(), recoveryController.analyzeRecovery)

// Generate a new adaptive recovery plan
router.post('/:planId/generate', requirePlanOwner(), recoveryController.generateRecoveryPlan)

module.exports = router
