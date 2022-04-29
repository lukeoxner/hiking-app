const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const Trail = require('../../models/Trail');

// * @route   POST api/trails
// * @desc    Create a trail
// * @access  Private
router.post(
	'/',
	[
		auth,
		[
			check('name', 'Name is required').not().isEmpty(),
			check('location', 'Location is required').not().isEmpty(),
			check('coordinates', 'Coordinates are required').not().isEmpty(),
			check('difficulty', 'Difficulty is required').not().isEmpty(),
			check('length', 'Length is required').not().isEmpty(),
			check('elevationGain', 'Elevation Gain is required').not().isEmpty(),
			check('imageLink', 'Image Link is required').not().isEmpty(),
			check('description', 'Description is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const newTrail = new Trail({
				name: req.body.name,
				location: req.body.location,
				coordinates: req.body.coordinates,
				difficulty: req.body.difficulty,
				length: req.body.length,
				elevationGain: req.body.elevationGain,
				imageLink: req.body.imageLink,
				description: req.body.description,
				tags: req.body.tags,
				comments: [],
			});

			const trail = await newTrail.save();

			res.json(trail);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// * @route   GET api/trails
// * @desc    Get all trails
// * @access  Private
router.get('/', auth, async (req, res) => {
	try {
		const trails = await Trail.find().sort({ name: 1 });
		res.json(trails);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// * @route   GET api/trails/:id
// * @desc    Get trail by ID
// * @access  Private
router.get('/:id', auth, async (req, res) => {
	try {
		const trail = await Trail.findById(req.params.id);
		if (!trail) {
			return res.status(404).json({ msg: 'Trail not found' });
		}
		res.json(trail);
	} catch (err) {
		console.error(err.message);
		if (err.kind == 'ObjectId') {
			return res.status(404).json({ msg: 'Trail not found' });
		}
		res.status(500).send('Server Error');
	}
});

// * @route   POST api/trails/comment/:id
// * @desc    Create a comment on a trail
// * @access  Private
router.post(
	'/comment/:id',
	[auth, [check('text', 'Text is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select('-password');
			const trail = await Trail.findById(req.params.id);

			if (!trail) {
				return res.status(404).json({ msg: 'Trail not found' });
			}

			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			};

			trail.comments.unshift(newComment);

			await trail.save();

			res.json(trail.comments);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// * @route   DELETE api/trails/comment/:id/:comment_id
// * @desc    Delete a comment on a trail
// * @access  Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
	try {
		const trail = await Trail.findById(req.params.id);
		const comment = trail.comments.find(
			(comment) => comment.id === req.params.comment_id
		);
		if (!comment) {
			return res.status(404).json({ msg: 'Comment not found' });
		}
		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		// Get remove index
		const removeIndex = trail.comments
			.map((comment) => comment.user.toString())
			.indexOf(req.user.id);

		trail.comments.splice(removeIndex, 1);

		await trail.save();

		res.json(trail.comments);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
