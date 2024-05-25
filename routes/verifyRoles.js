const express = require('express');
const { verifyVoters, verifyPoliticians, verifyElectoralHead } = require('../controllers/verifyRoleController');
const { checkRole } = require('../middlewares/authMiddleware');
const router = express.Router();


router.post('/verify-voters', checkRole('electoral_head'), verifyVoters);
router.post('/verify-politicians', checkRole('electoral_head'), verifyPoliticians);
router.post('/verify-electoral-head', checkRole('admin'), verifyElectoralHead);

module.exports = router;