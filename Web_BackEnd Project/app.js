const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const mongoose = require('mongoose')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const authRoutes = require('./routes/authRoutes')
const apiRoutes = require('./routes/apiRoutes')
const mainRoutes = require('./routes/mainRoutes')
const transactionRoutes = require('./routes/transactionRoutes')

require('dotenv').config()

const app = express()

if (!process.env.MONGODB_URI) {
	console.error('Missing MONGODB_URI environment variable. Set it in your .env file (see .env.example).')
	process.exit(1)
}

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.info('Connected to MongoDB')
	})
	.catch(err => {
		console.error('Error: ', err)
	})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static('public'))

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

app.use(
	session({
		secret: process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me',
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false },
	})
)

// Route to handle Gemini API integration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

app.get('/ai-generate', async (req, res) => {
	try {
		const prompt = req.query.prompt || 'Explain how AI works'
		console.log('Prompt received:', prompt)

		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
		const result = await model.generateContent(prompt)

		console.log('Full Response:', JSON.stringify(result, null, 2))

		// Extract the text from the nested structure
		const generatedText =
			result.response.candidates[0]?.content?.parts[0]?.text ||
			'No content generated.'

		res.json({ success: true, response: generatedText })
	} catch (error) {
		console.error('Error in /ai-generate:', error)
		res
			.status(500)
			.json({ success: false, message: 'Failed to generate content.' })
	}
})

app.use('/auth', authRoutes)
app.use('/api', apiRoutes)
app.use('/', mainRoutes)
app.use('/transaction', transactionRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
