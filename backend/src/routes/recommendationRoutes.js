const express = require('express')
const recommendationController = require('../controllers/recommendationController')
const requireAuth = require('../middleware/auth')
const { requirePlanOwner } = require('../middleware/ownership')

const router = express.Router()

router.use(requireAuth)

// Generate AI recommendation for a study plan
router.post('/', requirePlanOwner('body', 'planId'), recommendationController.generateRecommendation)

module.exports = router
