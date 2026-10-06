const express = require('express')

const progressController = require('../controllers/progressController')
const requireAuth = require('../middleware/auth')
const { requirePlanOwner } = require('../middleware/ownership')

const router = express.Router()

router.use(requireAuth)

// UPDATE TASK PROGRESS
router.patch('/task', requirePlanOwner('body', 'planId'), progressController.updateTaskProgress)

// GET DAY DEVIATION
router.get(
  '/:planId/day/:dayNumber/deviation',
  requirePlanOwner(),
  progressController.getDayDeviation
)

// GET DAY PROGRESS
router.get('/:planId/day/:dayNumber', requirePlanOwner(), progressController.getDayProgress)

// GET PLAN DEVIATION
router.get('/:planId/deviation', requirePlanOwner(), progressController.getPlanDeviation)

// GET PLAN PROGRESS
router.get('/:planId', requirePlanOwner(), progressController.getPlanProgress)

module.exports = router
