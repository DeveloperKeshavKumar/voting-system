const express = require('express');
const multer = require('../config/multer');
const { register, login } = require('../controllers/authController');
const router = express.Router();

router.post('/register', multer.fields([
    { name: 'photoUrl', maxCount: 1 },
    { name: 'personalDocUrl', maxCount: 1 },
    { name: 'incomeDocUrl', maxCount: 1 },
    { name: 'affidavitforcrimesUrl', maxCount: 1 },
    { name: 'educationDocUrl', maxCount: 1 },
    { name: 'partySymbol', maxCount: 1 }
]), register);
router.post('/login', login);

module.exports = router;
