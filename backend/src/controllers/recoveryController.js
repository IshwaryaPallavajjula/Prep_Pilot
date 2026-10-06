const recoveryService = require('../services/recoveryService')

async function analyzeRecovery(req, res, next) {
  try {
    const { planId } = req.params

    const recovery =
      await recoveryService.analyzeRecovery(planId)

    res.status(200).json({
      success: true,
      message: 'Recovery analysis completed successfully',
      data: recovery,
    })
  } catch (error) {
    next(error)
  }
}

async function generateRecoveryPlan(req, res, next) {
  try {
    const { planId } = req.params

    const recovery =
      await recoveryService.generateRecoveryPlan(planId, {
        today: req.clientToday,
      })

    res.status(201).json({
      success: true,
      message: 'Adaptive recovery plan generated successfully',
      data: recovery,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  analyzeRecovery,
  generateRecoveryPlan,
}