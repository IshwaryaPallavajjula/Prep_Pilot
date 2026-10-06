const express = require('express')
const {
  createGoal,
  getGoalsByUser,
  getGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goalController')
const requireAuth = require('../middleware/auth')
const { requireGoalOwner, requireSelfParam } = require('../middleware/ownership')

const router = express.Router()

router.use(requireAuth)

router.post('/', createGoal)
router.get('/user/:userId', requireSelfParam('userId'), getGoalsByUser)
router.get('/:id', requireGoalOwner('params', 'id'), getGoal)
router.put('/:id', requireGoalOwner('params', 'id'), updateGoal)
router.delete('/:id', requireGoalOwner('params', 'id'), deleteGoal)

module.exports = router
