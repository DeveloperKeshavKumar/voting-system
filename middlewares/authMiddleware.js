const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Utility function to extract token from various sources
const extractToken = (req) => {
  let token = req.cookies.token || req.body.token || null;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  return token;
};

// Utility function to verify token and fetch user
const verifyAndFetchUser = async (token) => {
  if (!token) {
    throw new Error('Token missing');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    req.user = await verifyAndFetchUser(token);
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Not authorized' });
  }
};

// Middleware to check user role
exports.checkRole = (allowedRole) => {
  return async (req, res, next) => {
    try {
      const token = extractToken(req);
      const user = await verifyAndFetchUser(token);

      if (user.role !== allowedRole) {
        return res.status(403).json({ success: false, message: 'Access forbidden' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ success: false, error: 'Not authorized' });
    }
  };
};