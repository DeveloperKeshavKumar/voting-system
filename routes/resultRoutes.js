const express = require('express');
const { getResults } = require('../controllers/resultController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Get results for a specific ballot
router.get('/results/:ballotId', protect, getResults);

module.exports = router;
