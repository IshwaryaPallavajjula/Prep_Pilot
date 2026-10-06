const recommendationService = require('../services/recommendationService')

async function generateRecommendation(req, res, next) {
  try {
    const { planId } = req.body

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'planId is required',
      })
    }

    const result =
      await recommendationService.generateRecommendation(planId)

    res.status(200).json({
      success: true,
      message: 'AI recommendation generated successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  generateRecommendation,
}