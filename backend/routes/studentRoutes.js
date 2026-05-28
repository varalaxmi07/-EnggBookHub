const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/verifyToken');

// GET /api/student/me
router.get('/me', authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.query('SELECT name FROM students WHERE id = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ name: result[0].name });
  });
});

// GET /api/student/mybooks
router.get('/mybooks', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const query = `
    SELECT b.book_id, b.title, bb.due_date, bb.borrow_date, bb.return_date, bb.status
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    WHERE bb.user_id = ? AND bb.status = 'borrowed'
  `;
  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('❌ Error fetching mybooks:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(result);
  });
});



// // GET /api/student/history
// router.get('/history', authenticateToken, (req, res) => {
//   const userId = req.user.id;
//   const query = `
//     SELECT b.title, bb.borrow_date, bb.due_date, bb.return_date, bb.status
//     FROM borrowed_books bb
//     JOIN books b ON bb.book_id = b.id
//     WHERE bb.user_id = ?
//     ORDER BY bb.borrow_date DESC
//   `;
//   db.query(query, [userId], (err, results) => {
//     if (err) return res.status(500).json({ error: err });
//     res.json(results);
//   });
// });

// POST /api/student/borrow
router.post('/borrow', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { bookId } = req.body;

  // 1. Check book availability using correct key
  db.query('SELECT quantity FROM books WHERE id = ?', [bookId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Server error (check book)' });

    const book = rows[0];
    if (!book || book.quantity <= 0) {
      return res.status(400).json({ message: 'Book not available' });
    }

    // 2. Set due date (borrow_date is auto-filled)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

    // 3. Insert borrow record
    db.query(
      'INSERT INTO borrowed_books (user_id, book_id, due_date, status) VALUES (?, ?, ?, ?)',
      [userId, bookId, dueDate, 'Borrowed'],
      (err) => {
        if (err) return res.status(500).json({ message: 'Error recording borrow' });

        // 4. Decrease book quantity
        db.query(
          'UPDATE books SET quantity = quantity - 1 WHERE id = ?',
          [bookId],
          (err) => {
            if (err) return res.status(500).json({ message: 'Error updating quantity' });

            res.status(200).json({ message: '✅ Book borrowed successfully' });
          }
        );
      }
    );
  });
});

module.exports = router;
