const insightService = require('../services/insightService')

async function getInsights(req, res, next) {
  try {
    const result = await insightService.getPlanInsights(
      req.params.planId
    )

    res.status(200).json({
      success: true,
      message: 'Plan insights generated successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getInsights,
}