const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();
const db = require('../db'); // ✅ Make sure this path is correct

const router = express.Router();

// Create a nodemailer transporter for sending email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// Function to generate a random OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);  // Generates a 6-digit OTP
}

// OTP send route
router.post('/password/send-otp', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  console.log("📧 Checking email:", email);

  const checkSql = 'SELECT * FROM users WHERE email = ?';
  db.query(checkSql, [email], (err, results) => {
    if (err) {
      console.error('❌ DB error during email check:', err);
      return res.status(500).json({ success: false, message: 'Server error during validation' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Email not found in records' });
    }

    // ✅ Email exists — proceed to send OTP
    const otp = generateOtp();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Error sending OTP email:', error);
        return res.status(500).json({ success: false, message: `Failed to send OTP. ${error.message}` });
      }

      console.log('✅ OTP sent:', info.response);
      res.status(200).json({ success: true, message: 'OTP sent successfully' });
    });
  });
});

module.exports = router;
