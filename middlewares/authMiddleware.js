const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Not authorized' });
  }
};


exports.checkRole = (allowedRole) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token || req.body.token || req.header('Authorization').replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ success: false, message: 'Token missing' });
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decodedToken.id);
      if (!user || user.role !== allowedRole) {
        return res.status(403).json({ success: false, message: 'Access forbidden' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
};