const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if token exists in header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Get the token after "Bearer"

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('❌ Token verification failed:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded; // decoded contains user id and role from the payload
    next();
  });
};
console.log('🔑 Loaded secretKey:', secretKey);

module.exports = verifyToken;
