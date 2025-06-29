const Transaction = require('../models/transactionModel')
const User = require('../models/userModel')

exports.indexPage = async (req, res) => {
	const landmarks = await Landmark.find()
	landmarks.map(landmark => {
		landmark.pictures = landmark.pictures.map(picture => picture.substring(6))
		return landmark
	})
	const user = req.session.user
	const loggedIn = req.session.isLoggedIn
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
