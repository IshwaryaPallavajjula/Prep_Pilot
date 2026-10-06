const express = require('express')
const {
  createPlan,
  getPlan,
  getPlansByUser,
  getActivePlan,
  getPlanVersions,
  getTodayFromPlan,
  updatePlan,
  updateTask,
} = require('../controllers/planController')
const requireAuth = require('../middleware/auth')
const { requirePlanOwner, requireSelfParam } = require('../middleware/ownership')

const router = express.Router()

router.use(requireAuth)

router.post('/', createPlan)

// "me" routes must be declared before the /:id routes
router.get('/me/active', getActivePlan)
router.get('/me/versions', getPlanVersions)

router.get('/user/:userId', requireSelfParam('userId'), getPlansByUser)
router.get('/:id/today', requirePlanOwner('params', 'id'), getTodayFromPlan)
router.get('/:id', requirePlanOwner('params', 'id'), getPlan)
router.put('/:id/tasks/:taskId', requirePlanOwner('params', 'id'), updateTask)
router.put('/:id', requirePlanOwner('params', 'id'), updatePlan)

module.exports = router
