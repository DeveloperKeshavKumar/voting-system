// Imports
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validateVoter, validatePolitician, validateElectoralHead } = require('../utils/userValidation');

exports.register = async (req, res) => {
  const { name, email, password, role, assets, education, dateOfBirth, partyName } = req.body;

  // Validate user based on their role
  let isValid = false;
  switch (role) {
    case 'voter':
      isValid = validateVoter(req.body);
      break;
    case 'politician':
      isValid = validatePolitician(req.body);
      break;
    case 'electoral_head':
      isValid = validateElectoralHead(req.body);
      break;
    default:
      isValid = true; // normal user
  }

  if (!isValid) {
    // Handle invalid user
    return res.status(400).json({ success: false, message: 'Invalid user data' });
  }

  const criminalRecords = role === 'politician' || role === 'electoral_head' ? JSON.parse(req.body?.criminalRecords): [];

  // File paths
  const photoUrl = req.files['photoUrl'] ? req.files['photoUrl'][0].path : '';
  const personalDocUrl = req.files['personalDocUrl'] ? req.files['personalDocUrl'][0].path : '';
  const incomeDocUrl = req.files['incomeDocUrl'] ? req.files['incomeDocUrl'][0].path : '';
  const affidavitforcrimesUrl = req.files['affidavitforcrimesUrl'] ? req.files['affidavitforcrimesUrl'][0].path : '';
  const educationDocUrl = req.files['educationDocUrl'] ? req.files['educationDocUrl'][0].path : '';
  const partySymbol = req.files['partySymbol'] ? req.files['partySymbol'][0].path : '';

  // Proceed with registration
  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });

    // If a user with the same email exists, return an error response
    if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email is already taken' });
    }
    
    // If the email is not already taken, create the new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      dateOfBirth,
      partyName,
      criminalRecords,
      assets,
      education,
      photoUrl,
      personalDocUrl,
      incomeDocUrl,
      affidavitforcrimesUrl,
      educationDocUrl,
      partySymbol
    });
    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    
    // Set the token in an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // set to true in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};