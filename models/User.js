const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
	},
	bookmarkedTrails: [
		{
			trail: {
				type: Schema.Types.ObjectId,
				ref: 'trails',
			},
		},
	],
	completedTrails: [
		{
			trail: {
				type: Schema.Types.ObjectId,
				ref: 'trails',
			},
		},
	],
});

module.exports = User = mongoose.model('user', UserSchema);
