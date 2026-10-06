const mockInterviewService =
  require('../services/mockInterviewService')

async function startInterview(req, res, next) {
  try {
    const result =
      await mockInterviewService.startInterview(
        req.params.planId
      )

    res.status(201).json({
      success: true,
      message: 'Mock interview started successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

async function submitAnswer(req, res, next) {
  try {
    const result =
      await mockInterviewService.submitAnswer(
        req.params.interviewId,
        req.body.answer
      )

    res.status(200).json({
      success: true,
      message: result.completed
        ? 'Mock interview completed successfully'
        : 'Answer evaluated successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

// --------------------------------------------------
// GET INTERVIEW REPORT
// --------------------------------------------------

async function getInterviewReport(
  req,
  res,
  next
) {
  try {
    const report =
      await mockInterviewService.getInterviewReport(
        req.params.interviewId
      )

    res.status(200).json({
      success: true,
      message:
        'Mock interview report fetched successfully',
      data: report,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  startInterview,
  submitAnswer,
  getInterviewReport,
}