const express = require('express')

const aiController = require('../controllers/aiController')
const requireAuth = require('../middleware/auth')
const { requirePlanOwner } = require('../middleware/ownership')

const router = express.Router()

router.use(requireAuth)

// goalId ownership is checked inside the controller
router.post('/generate-plan', aiController.generatePlan)

router.post('/adapt-plan', requirePlanOwner('body', 'planId'), aiController.adaptPlan)

module.exports = router
