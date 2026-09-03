const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Landmark = require('../models/landmarkModel')

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads')
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadsDir),
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname)
		cb(null, `pictures-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
	},
})

// Matches the admin panel's <input name="pictures" multiple> which sends
// up to 3 files under the field name "pictures".
exports.uploadMiddleware = multer({ storage }).array('pictures', 3)

exports.createLandmark = async (req, res) => {
	try {
		const { title, description } = req.body
		if (!title || !description) {
			return res.status(400).json({ message: 'title and description are required' })
		}
		const pictures = (req.files || []).map(f => `/uploads/${f.filename}`)

		const landmark = new Landmark({ title, description, pictures })
		await landmark.save()
		res.status(201).json(landmark)
	} catch (error) {
		console.error('Error creating landmark:', error)
		res.status(500).json({ message: 'Failed to create landmark' })
	}
}

exports.getAllLandmarks = async (req, res) => {
	try {
		const landmarks = await Landmark.find().sort({ publishedDate: -1 })
		res.json(landmarks)
	} catch (error) {
		console.error('Error fetching landmarks:', error)
		res.status(500).json({ message: 'Failed to fetch landmarks' })
	}
}

exports.getLandmarkById = async (req, res) => {
	try {
		const landmark = await Landmark.findById(req.params.id)
		if (!landmark) {
			return res.status(404).json({ message: 'Landmark not found' })
		}
		res.json(landmark)
	} catch (error) {
		console.error('Error fetching landmark:', error)
		res.status(500).json({ message: 'Failed to fetch landmark' })
	}
}

// Note: the admin panel's update form sends JSON (title/description only),
// not multipart form data, so picture replacement isn't wired up here — only
// text fields update. This matches what the existing frontend actually sends.
exports.updateLandmark = async (req, res) => {
	try {
		const update = { updatedDate: new Date() }
		if (req.body.title) update.title = req.body.title
		if (req.body.description) update.description = req.body.description

		const landmark = await Landmark.findByIdAndUpdate(req.params.id, update, {
			new: true,
		})
		if (!landmark) {
			return res.status(404).json({ message: 'Landmark not found' })
		}
		res.json(landmark)
	} catch (error) {
		console.error('Error updating landmark:', error)
		res.status(500).json({ message: 'Failed to update landmark' })
	}
}

exports.deleteLandmark = async (req, res) => {
	try {
		const landmark = await Landmark.findByIdAndDelete(req.params.id)
		if (!landmark) {
			return res.status(404).json({ message: 'Landmark not found' })
		}
		res.json({ message: 'Landmark deleted' })
	} catch (error) {
		console.error('Error deleting landmark:', error)
		res.status(500).json({ message: 'Failed to delete landmark' })
	}
}
