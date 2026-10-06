const weakAreaService = require('../services/weakAreaService')

async function getWeakAreas(req, res, next) {
  try {
    const { planId } = req.params

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'planId is required',
      })
    }

    const result = await weakAreaService.getWeakAreas(planId)

    res.status(200).json({
      success: true,
      message: 'Weak areas analyzed successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getWeakAreas,
}