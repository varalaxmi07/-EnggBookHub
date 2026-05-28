const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); // ✅ ADD THIS
const app = express();
const port = process.env.PORT || 3000;

// ✅ Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Route shortcut
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/manage_users.html'));
});


// ✅ Database connection
require('./db');

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const passwordRoutes = require('./routes/passwordRoutes'); 

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', passwordRoutes);

// ✅ Server start
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
