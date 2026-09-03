const mongoose = require('mongoose')

const landmarkSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true },
	description: { type: String, required: true, trim: true },
	// Stored as web-servable paths, e.g. "/uploads/pictures-169999.jpg"
	// (public/ is served statically, see app.js: app.use(express.static('public'))).
	pictures: [{ type: String }],
	publishedDate: { type: Date, default: Date.now },
	updatedDate: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Landmark', landmarkSchema)
