const express = require('express');
const { createBallot, getBallots, getBallotById, updateBallot, deleteBallot } = require('../controllers/ballotController');
const router = express.Router();
const { checkRole } = require('../middlewares/authMiddleware');

// Create a new ballot
router.post('/create', checkRole('electoral_head'), createBallot);

// Get all ballots
router.get('/', getBallots);

// Get a ballot by ID
router.get('/:id', getBallotById);

// Update a ballot by ID
router.put('/:id', checkRole('electoral_head'), updateBallot);

// Delete a ballot by ID
router.delete('/:id', checkRole('electoral_head'), deleteBallot);

module.exports = router;
