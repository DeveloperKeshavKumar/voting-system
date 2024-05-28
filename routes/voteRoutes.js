const express = require('express');
const { castVote } = require('../controllers/voteController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Cast a vote
router.post('/', protect, castVote);

module.exports = router;