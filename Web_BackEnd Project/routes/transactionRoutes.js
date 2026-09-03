const express = require('express')
const router = express.Router()
const axios = require('axios')
const User = require('../models/userModel')

// The transaction microservice (Go) runs as a separate service. Locally it's
// on localhost:8081; in production set TRANSACTION_SERVICE_URL to that
// service's deployed URL (e.g. Render service URL) as an env var.
const TRANSACTION_SERVICE_URL =
	process.env.TRANSACTION_SERVICE_URL || 'http://localhost:8081'

router.post('/create-transaction', async (req, res) => {
	try {
		const response = await axios.post(
			`${TRANSACTION_SERVICE_URL}/transaction`,
			req.body
		)
		res.json({ success: true, paymentForm: response.data })
	} catch (error) {
		console.error('Error creating transaction:', error)
		res
			.status(500)
			.json({ success: false, message: 'Failed to create transaction' })
	}
})

router.post('/payment', async (req, res) => {
	try {
		const response = await axios.post(`${TRANSACTION_SERVICE_URL}/payment`, req.body)
		res.json({ success: true, message: response.data })
	} catch (error) {
		console.error('Error processing payment:', error)
		res
			.status(500)
			.json({ success: false, message: 'Failed to process payment' })
	}
})

// Route to update user role
router.post('/auth/updateRole', async (req, res) => {
	const { userID, role } = req.body
	try {
		await User.findByIdAndUpdate(userID, { role })
		req.session.user.role = role // Update session data
		res
			.status(200)
			.json({ success: true, message: 'Role updated successfully' })
	} catch (error) {
		console.error('Error updating role:', error)
		res.status(500).json({ success: false, message: 'Failed to update role' })
	}
})

module.exports = router
