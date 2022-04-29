const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trailSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	location: {
		type: String,
		required: true,
	},
	coordinates: {
		type: String,
		required: true,
	},
	difficulty: {
		type: String,
		required: true,
	},
	length: {
		type: String,
		required: true,
	},
	elevationGain: {
		type: String,
		required: true,
	},
	imageLink: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	tags: [
		{
			type: String,
			required: true,
		},
	],
	comments: [
		{
			user: {
				type: Schema.Types.ObjectId,
				ref: 'users',
			},
			text: {
				type: String,
				required: true,
			},
			name: {
				type: String,
			},
			avatar: {
				type: String,
			},
			date: {
				type: Date,
				default: Date.now,
			},
		},
	],
});

module.exports = Trail = mongoose.model('trail', trailSchema);
