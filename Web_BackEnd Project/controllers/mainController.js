const Transaction = require('../models/transactionModel')
const User = require('../models/userModel')
const Landmark = require('../models/landmarkModel')

exports.indexPage = async (req, res) => {
	const user = req.session.user
	const loggedIn = req.session.isLoggedIn || false
	const isAdmin = loggedIn && user && user.role === 'admin'

	let landmarks = []
	try {
		landmarks = await Landmark.find().sort({ publishedDate: -1 })
	} catch (error) {
		console.error('Error fetching landmarks for homepage:', error)
	}

	res.render('index', { landmarks, user, loggedIn, isAdmin })
}

exports.account = async (req, res) => {
	const user = req.session.user
	const loggedIn = req.session.isLoggedIn
	if (loggedIn) {
		let isAdmin = false
		isAdmin = user.role === 'admin'

		// Fetch the latest transaction for the user
		const transaction = await Transaction.findOne({
			'customer.id': user._id,
		}).sort({ updatedAt: -1 })

		res.render('account', { user, isAdmin, loggedIn, transaction })
	} else {
		res.redirect('/')
	}
}

exports.cartPage = (req, res) => {
	const user = req.session.user
	const loggedIn = req.session.isLoggedIn
	res.render('cart', { user, loggedIn })
}

exports.adminPage = (req, res) => {
	const user = req.session.user
	const loggedIn = req.session.isLoggedIn || false
	const isAdmin = loggedIn && user && user.role === 'admin'

	if (!loggedIn || !isAdmin) {
		return res.redirect('/')
	}

	res.render('admin', { user, loggedIn, isAdmin })
}

exports.stockMarketAPI = (req, res) => {
	const user = req.session.user
	const loggedIn = req.session.isLoggedIn || false
	res.render('stockmarketapi', { user, loggedIn })
}

exports.newsAPI = (req, res) => {
	const user = req.session.user
	const loggedIn = req.session.isLoggedIn || false
	res.render('newsapi', { user, loggedIn })
}

exports.inRussianEmpirePage = (req, res) => {
	const user = req.session.user
	const loggedIn = req.session.isLoggedIn || false
	res.render('inRussianEmpire', { user, loggedIn })
}

exports.kazakhKhanatePage = (req, res) => {
	const user = req.session.user
	const loggedIn = req.session.isLoggedIn || false
	res.render('kazakhKhanate', { user, loggedIn })
}

exports.partOfUSSRPage = (req, res) => {
	const user = req.session.user
	const loggedIn = req.session.isLoggedIn || false
	res.render('partOfUSSR', { user, loggedIn })
}

// The quiz feature originally depended on a `quizQuestionModel` that was
// never added to the repo (only a seed script referencing it existed), so
// there is no working DB-backed source of questions. Using a small static
// set here keeps the page functional for a demo instead of crashing.
const STATIC_QUIZ_QUESTIONS = [
	{
		question: 'What countries does Kazakhstan border with? (choose 5)',
		options: [
			'Russia',
			'Mongolia',
			'China',
			'Kyrgyzstan',
			'Turkiye',
			'Tajikistan',
			'Turkmenistan',
			'Uzbekistan',
		],
		correctAnswer: ['Russia', 'China', 'Kyrgyzstan', 'Turkmenistan', 'Uzbekistan'],
	},
	{
		question: 'Who established the Kazakh Khanate?',
		options: ['Janibek Khan and Kerei Khan', "Abu'l-Khayr", 'Jochi Khan', 'Kenesary Khan'],
		correctAnswer: ['Janibek Khan and Kerei Khan'],
	},
	{
		question: 'Which Juz was the first to join the Russian Empire?',
		options: ['Junior Juz', 'Middle Juz', 'Senior Juz'],
		correctAnswer: ['Junior Juz'],
	},
]

exports.quizPage = (req, res) => {
	const user = req.session.user
	const loggedIn = req.session.isLoggedIn || false

	if (!loggedIn) {
		return res.redirect('/')
	}

	res.render('quiz', { user, loggedIn, quizQuestions: STATIC_QUIZ_QUESTIONS })
}
