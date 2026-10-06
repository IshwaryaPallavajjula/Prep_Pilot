const express = require('express')

const mockInterviewController = require('../controllers/mockInterviewController')
const requireAuth = require('../middleware/auth')
const { requirePlanOwner, requireInterviewOwner } = require('../middleware/ownership')

const router = express.Router()

router.use(requireAuth)

// Start mock interview
router.post('/start/:planId', requirePlanOwner(), mockInterviewController.startInterview)

// Submit answer and get AI evaluation
router.post('/:interviewId/answer', requireInterviewOwner(), mockInterviewController.submitAnswer)

// Get completed/interview report
router.get('/:interviewId/report', requireInterviewOwner(), mockInterviewController.getInterviewReport)

module.exports = router
