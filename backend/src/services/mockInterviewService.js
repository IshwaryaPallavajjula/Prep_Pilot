const { GoogleGenerativeAI } = require('@google/generative-ai')
const MockInterview = require('../models/MockInterview')
const Plan = require('../models/Plan')
const Goal = require('../models/Goal')
const AppError = require('../utils/AppError')
const isValidObjectId = require('../utils/isValidObjectId')

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not configured')
}

const genAI = apiKey
  ? new GoogleGenerativeAI(apiKey)
  : null

function cleanResponse(text) {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()
}

// --------------------------------------------------
// START MOCK INTERVIEW
// --------------------------------------------------

async function startInterview(planId) {
  if (!isValidObjectId(planId)) {
    throw new AppError('Invalid plan id', 400)
  }

  if (!genAI) {
    throw new AppError(
      'GEMINI_API_KEY is not configured',
      500
    )
  }

  const plan = await Plan.findById(planId)

  if (!plan) {
    throw new AppError('Plan not found', 404)
  }

  const goal = await Goal.findById(plan.goalId)

  if (!goal) {
    throw new AppError('Goal not found', 404)
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
  })

  const prompt = `
You are PrepPilot Mock Interviewer.

Create the FIRST question for a technical interview.

Use ONLY the information contained in the goal and preparation plan.

GOAL:
${JSON.stringify(goal, null, 2)}

PLAN:
${JSON.stringify(
  {
    title: plan.title,
    days: plan.days.map((day) => ({
      focus: day.focus,
      tasks: day.tasks.map((task) => ({
        title: task.title,
        type: task.type,
      })),
    })),
  },
  null,
  2
)}

Return ONLY valid JSON.

{
  "question": "string",
  "category": "string",
  "difficulty": "EASY"
}

Rules:
- Do not invent companies.
- Do not invent candidate information.
- Make the question interview-oriented.
- Start with EASY difficulty.
`

  try {
    const result = await model.generateContent(prompt)

    const parsed = JSON.parse(
      cleanResponse(result.response.text())
    )

    const interview = await MockInterview.create({
      userId: plan.userId,
      planId: plan._id,
      goalId: plan.goalId,
      status: 'IN_PROGRESS',
      currentQuestion: 1,
      totalQuestions: 5,
      startedAt: new Date(),

      questions: [
        {
          questionNumber: 1,
          question: parsed.question,
          category: parsed.category,
          difficulty: parsed.difficulty || 'EASY',
        },
      ],
    })

    return interview
  } catch (error) {
    console.error('Mock interview start error:', error)

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      'Failed to start mock interview',
      500
    )
  }
}

// --------------------------------------------------
// SUBMIT ANSWER + AI EVALUATION
// --------------------------------------------------

async function submitAnswer(interviewId, answer) {
  if (!isValidObjectId(interviewId)) {
    throw new AppError('Invalid interview id', 400)
  }

  if (!answer || typeof answer !== 'string') {
    throw new AppError('Answer is required', 400)
  }

  if (!genAI) {
    throw new AppError(
      'GEMINI_API_KEY is not configured',
      500
    )
  }

  const interview = await MockInterview.findById(
    interviewId
  )

  if (!interview) {
    throw new AppError(
      'Mock interview not found',
      404
    )
  }

  if (interview.status === 'COMPLETED') {
    throw new AppError(
      'Mock interview already completed',
      400
    )
  }

  const currentQuestion =
    interview.questions.find(
      (question) =>
        question.questionNumber ===
        interview.currentQuestion
    )

  if (!currentQuestion) {
    throw new AppError(
      'Current question not found',
      404
    )
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
  })

  const prompt = `
You are PrepPilot AI Interview Evaluator.

Evaluate the candidate's answer to the interview question.

QUESTION:
${currentQuestion.question}

CATEGORY:
${currentQuestion.category}

DIFFICULTY:
${currentQuestion.difficulty}

CANDIDATE ANSWER:
${answer}

Return ONLY valid JSON.

{
  "score": 0,
  "feedback": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "nextQuestion": "string",
  "nextCategory": "string",
  "nextDifficulty": "EASY"
}

Rules:
- score must be an integer from 0 to 10.
- Evaluate only the answer provided.
- Do not invent candidate information.
- Feedback should be concise and useful.
- Identify specific strengths.
- Identify specific weaknesses.
- Generate a relevant next interview question.
- Increase difficulty gradually when the answer is strong.
- Keep similar or reduce difficulty when the answer is weak.
- nextDifficulty must be EASY, MEDIUM or HARD.
`

  try {
    const result = await model.generateContent(prompt)

    const cleaned = cleanResponse(
      result.response.text()
    )

    const evaluation = JSON.parse(cleaned)

    // Save candidate answer
    currentQuestion.answer = answer

    // Save AI evaluation
    currentQuestion.score =
      Math.max(
        0,
        Math.min(
          10,
          Number(evaluation.score) || 0
        )
      )

    currentQuestion.feedback =
      evaluation.feedback || ''

    currentQuestion.strengths =
      Array.isArray(evaluation.strengths)
        ? evaluation.strengths
        : []

    currentQuestion.weaknesses =
      Array.isArray(evaluation.weaknesses)
        ? evaluation.weaknesses
        : []

    // ----------------------------------------------
    // CHECK IF THIS WAS THE LAST QUESTION
    // ----------------------------------------------

    const isLastQuestion =
      interview.currentQuestion >=
      interview.totalQuestions

    if (isLastQuestion) {
      const scores = interview.questions
        .map((question) => question.score)
        .filter(
          (score) =>
            typeof score === 'number'
        )

      const totalScore = scores.reduce(
        (sum, score) => sum + score,
        0
      )

      interview.overallScore =
        scores.length > 0
          ? Math.round(
              (totalScore / scores.length) * 10
            ) / 10
          : 0

      interview.status = 'COMPLETED'
      interview.completedAt = new Date()

      await interview.save()

      return {
        interview,
        evaluation,
        completed: true,
      }
    }

    // ----------------------------------------------
    // GENERATE NEXT QUESTION
    // ----------------------------------------------

    interview.currentQuestion += 1

    interview.questions.push({
      questionNumber:
        interview.currentQuestion,

      question:
        evaluation.nextQuestion ||
        'Explain another important concept related to your preparation.',

      category:
        evaluation.nextCategory ||
        currentQuestion.category,

      difficulty:
        ['EASY', 'MEDIUM', 'HARD'].includes(
          evaluation.nextDifficulty
        )
          ? evaluation.nextDifficulty
          : 'MEDIUM',

      answer: '',
      score: null,
      feedback: '',
      strengths: [],
      weaknesses: [],
    })

    await interview.save()

    return {
      interview,
      evaluation,
      completed: false,
    }
  } catch (error) {
    console.error(
      'Mock interview answer evaluation error:',
      error
    )

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      'Failed to evaluate interview answer',
      500
    )
  }
}

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------
// --------------------------------------------------
// GET INTERVIEW REPORT
// --------------------------------------------------

async function getInterviewReport(interviewId) {
  if (!isValidObjectId(interviewId)) {
    throw new AppError('Invalid interview id', 400)
  }

  const interview = await MockInterview.findById(
    interviewId
  )

  if (!interview) {
    throw new AppError(
      'Mock interview not found',
      404
    )
  }

  const questions = interview.questions || []

  const answeredQuestions = questions.filter(
    (question) =>
      question.answer &&
      question.answer.trim().length > 0
  )

  // ----------------------------------------------
  // CATEGORY PERFORMANCE
  // ----------------------------------------------

  const categoryMap = {}

  for (const question of answeredQuestions) {
    const category = question.category || 'General'

    if (!categoryMap[category]) {
      categoryMap[category] = {
        totalScore: 0,
        questionCount: 0,
      }
    }

    categoryMap[category].totalScore +=
      typeof question.score === 'number'
        ? question.score
        : 0

    categoryMap[category].questionCount++
  }

  const categoryPerformance = Object.entries(
    categoryMap
  ).map(([category, data]) => ({
    category,
    score:
      data.questionCount > 0
        ? Math.round(
            (data.totalScore / data.questionCount) * 10
          ) / 10
        : 0,
    questions: data.questionCount,
  }))

  // ----------------------------------------------
  // COLLECT STRENGTHS AND WEAKNESSES
  // ----------------------------------------------

  const strengths = [
    ...new Set(
      questions.flatMap((question) =>
        Array.isArray(question.strengths)
          ? question.strengths
          : []
      )
    ),
  ]

  const weaknesses = [
    ...new Set(
      questions.flatMap((question) =>
        Array.isArray(question.weaknesses)
          ? question.weaknesses
          : []
      )
    ),
  ]

  // ----------------------------------------------
  // FIND WEAK CATEGORIES
  // ----------------------------------------------

  const weakCategories = categoryPerformance
    .filter((item) => item.score < 6)
    .map((item) => item.category)

  // ----------------------------------------------
  // GENERATE RECOMMENDATIONS
  // ----------------------------------------------

  const recommendations = []

  if (weakCategories.length > 0) {
    weakCategories.forEach((category) => {
      recommendations.push(
        `Revise and practice interview questions related to ${category}.`
      )
    })
  }

  if (weaknesses.length > 0) {
    weaknesses.slice(0, 3).forEach((weakness) => {
      recommendations.push(
        `Improve: ${weakness}`
      )
    })
  }

  if (
    typeof interview.overallScore === 'number' &&
    interview.overallScore < 6
  ) {
    recommendations.push(
      'Focus on fundamentals and practice more problems before the next mock interview.'
    )
  } else if (
    typeof interview.overallScore === 'number' &&
    interview.overallScore < 8
  ) {
    recommendations.push(
      'Continue practicing and focus on improving weaker interview areas.'
    )
  } else if (
    typeof interview.overallScore === 'number'
  ) {
    recommendations.push(
      'Maintain the current preparation level and practice harder interview questions.'
    )
  }

  // ----------------------------------------------
  // RETURN REPORT
  // ----------------------------------------------

  return {
    interviewId: interview._id,
    planId: interview.planId,
    goalId: interview.goalId,

    status: interview.status,

    overallScore: interview.overallScore,

    totalQuestions: interview.totalQuestions,

    answeredQuestions: answeredQuestions.length,

    completed:
      interview.status === 'COMPLETED',

    startedAt: interview.startedAt,

    completedAt: interview.completedAt,

    categoryPerformance,

    strengths,

    weaknesses,

    weakCategories,

    recommendations,

    questions: questions.map((question) => ({
      questionNumber:
        question.questionNumber,

      question:
        question.question,

      category:
        question.category,

      difficulty:
        question.difficulty,

      score:
        question.score,

      feedback:
        question.feedback,

      strengths:
        question.strengths,

      weaknesses:
        question.weaknesses,
    })),
  }
}
module.exports = {
  startInterview,
  submitAnswer,
  getInterviewReport,
}