const coachService = require('../services/coachService')

async function chat(req, res, next) {
  try {
    const { planId } = req.params
    const { message } = req.body

    const result =
      await coachService.getCoachResponse(
        planId,
        message
      )

    res.status(200).json({
      success: true,
      message: 'AI coach response generated successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  chat,
}