const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware.js'); // ✅ Corrected import
console.log('✅ authenticateToken loaded:', typeof authenticateToken);
require('dotenv').config();

const router = express.Router();
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

// 🔐 Signup route
router.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;

  const checkSql = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.query(checkSql, [username, email], async (err, results) => {
    if (err) {
      console.error('DB check error:', err);
      return res.status(500).json({ success: false, message: 'Server error during validation.' });
    }

    if (results.length > 0) {
      return res.status(409).json({ success: false, message: 'Username or email already exists.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertSql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';

      db.query(insertSql, [username, email, hashedPassword, role], (err, result) => {
        if (err) {
          console.error('DB insert error:', err);
          return res.status(500).json({ success: false, message: 'Signup failed. Please try again.' });
        }

        res.status(201).json({ success: true, message: 'User registered successfully!' });
      });
    } catch (error) {
      console.error('Hashing error:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  });
});

// 🔐 Login route
router.post('/login', (req, res) => {
  const { username, password, role } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ?';

  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error('Login DB error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (user.role !== role) {
      return res.status(403).json({ success: false, message: 'Incorrect role selected' });
    }

    const token = jwt.sign({ id: user.id, username:user.username,role: user.role }, secretKey, { expiresIn: '1h' });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      role: user.role,
      username: user.username
    });
  });
});

// 🧠 Get logged in user (student) info
router.get('/me', authenticateToken, (req, res) => {
  db.query('SELECT name FROM students WHERE id = ?', [req.user.id], (err, rows) => {
    if (err) {
      console.error('User fetch error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(rows[0]);
  });
});

// OTP send route
router.post('/password/send-otp', (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Send OTP logic goes here
  // For example, generate an OTP, send it via email, etc.

  res.status(200).json({ success: true, message: 'OTP sent successfully' });
});

module.exports = router;
