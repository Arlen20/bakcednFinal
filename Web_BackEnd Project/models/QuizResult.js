const mongoose = require('mongoose')

const QuizResult = mongoose.model('QuizResult', quizResultSchema)
module.exports = QuizResult
