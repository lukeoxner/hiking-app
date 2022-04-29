const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const Trail = require('../../models/Trail');

// * @route     POST api/users
// * @desc      Register user
// * @access    Public
router.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please include a valid email').not().isEmpty(),
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({ min: 6 }),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		let { name, avatar, email, password } = req.body;

		if (avatar == '') {
			avatar = 'https://www.gravatar.com/avatar/a?s=200&r=pg&d=mm';
		}

		try {
			// See if user already exists
			let user = await User.findOne({ email: email });
			// If user already exists, send error
			if (user) {
				return res.status(400).json({
					errors: [{ msg: 'User already exists' }],
				});
			}

			// Create new user (does NOT save to database)
			user = new User({
				name,
				email,
				avatar,
				password,
			});

			// Encrypt password using bcrypt
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			// Save user to database, returns promise
			await user.save();

			// Return JsonWebToken
			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 3600000 },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.log(err.message);
			res.status(500).send('Server error');
		}
	}
);

// * @route   DELETE api/users
// * @desc    Delete user
// * @access  Private
router.delete('/', auth, async (req, res) => {
	try {
		// Remove user
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: 'User deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// * @route   PUT api/users/bookmarked/add/:id
// * @desc    Add a trail to user's bookmarked trails
// * @access  Private
router.put('/bookmarked/add/:id', auth, async (req, res) => {
	try {
		const reqTrail = await Trail.findById(req.params.id);
		const user = await User.findById(req.user.id).select('-password');

		if (!reqTrail) {
			return res.status(404).json({ msg: 'Trail not found' });
		}

		// Check if trail has already been bookmarked
		if (
			user.bookmarkedTrails.filter(
				(bookmarkedTrail) => bookmarkedTrail.trail == reqTrail.id
			).length > 0
		) {
			return res.status(400).json({ msg: 'Trail already bookmarked' });
		}

		user.bookmarkedTrails.unshift({ trail: reqTrail.id });

		await user.save();

		res.json(user.bookmarkedTrails);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// * @route   PUT api/users/bookmarked/remove/:id
// * @desc    Remove a trail from user's bookmarked trails
// * @access  Private
router.put('/bookmarked/remove/:id', auth, async (req, res) => {
	try {
		const reqTrail = await Trail.findById(req.params.id);
		const user = await User.findById(req.user.id).select('-password');

		if (!reqTrail) {
			return res.status(404).json({ msg: 'Trail not found' });
		}

		// Check if trail has already been bookmarked
		if (
			user.bookmarkedTrails.filter(
				(bookmarkedTrail) => bookmarkedTrail.trail == reqTrail.id
			).length === 0
		) {
			return res.status(400).json({ msg: 'Trail not yet bookmarked' });
		}

		// Get remove index
		const removeIndex = user.bookmarkedTrails
			.map((bookmarkedTrail) => bookmarkedTrail.trail.toString())
			.indexOf(req.params.id);

		user.bookmarkedTrails.splice(removeIndex, 1);

		await user.save();

		res.json(user.bookmarkedTrails);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// * @route   PUT api/users/completed/add/:id
// * @desc    Add a trail to user's completed trails
// * @access  Private
router.put('/completed/add/:id', auth, async (req, res) => {
	try {
		const reqTrail = await Trail.findById(req.params.id);
		const user = await User.findById(req.user.id).select('-password');

		if (!reqTrail) {
			return res.status(404).json({ msg: 'Trail not found' });
		}

		// Check if trail has already been completed
		if (
			user.completedTrails.filter(
				(completedTrail) => completedTrail.trail == reqTrail.id
			).length > 0
		) {
			return res.status(400).json({ msg: 'Trail already completed' });
		}

		user.completedTrails.unshift({ trail: reqTrail.id });

		await user.save();

		res.json(user.completedTrails);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// * @route   PUT api/users/completed/remove/:id
// * @desc    Remove a trail from user's completed trails
// * @access  Private
router.put('/completed/remove/:id', auth, async (req, res) => {
	try {
		const reqTrail = await Trail.findById(req.params.id);
		const user = await User.findById(req.user.id).select('-password');

		if (!reqTrail) {
			return res.status(404).json({ msg: 'Trail not found' });
		}

		// Check if trail has already been completed
		if (
			user.completedTrails.filter(
				(completedTrail) => completedTrail.trail == reqTrail.id
			).length === 0
		) {
			return res.status(400).json({ msg: 'Trail not yet completed' });
		}

		// Get remove index
		const removeIndex = user.completedTrails
			.map((completedTrail) => completedTrail.trail.toString())
			.indexOf(req.params.id);

		user.completedTrails.splice(removeIndex, 1);

		await user.save();

		res.json(user.completedTrails);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
