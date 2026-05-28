const express = require('express');
const db = require('../db'); // Database connection
const router = express.Router();

// ✅ Dashboard Stats Route
router.get('/dashboard-stats', (req, res) => {
  const stats = {};

  const queries = [
    { sql: 'SELECT COUNT(*) AS totalBooks FROM books', key: 'totalBooks' },
    { sql: 'SELECT COUNT(*) AS totalUsers FROM users', key: 'totalUsers' },
    { sql: "SELECT COUNT(*) AS booksIssued FROM borrowed_books WHERE status = 'borrowed'", key: 'booksIssued' }
  ];

  let completed = 0;
  let hasError = false;

  queries.forEach(q => {
    db.query(q.sql, (err, result) => {
      if (hasError) return;

      if (err) {
        hasError = true;
        console.error(`Error fetching ${q.key}:`, err);
        return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
      }

      stats[q.key] = result[0][q.key];
      completed++;

      if (completed === queries.length) {
        res.json(stats);
      }
    });
  });
});

// ✅ Get all users with borrowed books info
// ✅ Get users with books they've borrowed
router.get('/users', (req, res) => {
  const sql = `
    SELECT u.id, u.username, u.email, b.title
    FROM users u
    LEFT JOIN borrowed_books bb ON u.id = bb.user_id AND bb.status = 'borrowed'
    LEFT JOIN books b ON bb.book_id = b.id
    WHERE u.role = 'student'
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users with books:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    // Group by user and collect books
    const usersMap = {};

    results.forEach(row => {
      if (!usersMap[row.id]) {
        usersMap[row.id] = {
          id: row.id,
          username: row.username,
          email: row.email,
          books: []
        };
      }
      if (row.title) {
        usersMap[row.id].books.push(row.title);
      }
    });

    res.json(Object.values(usersMap));
  });
});


// ✅ Add a new book
router.post('/add-book', (req, res) => {
  const { title, author, quantity } = req.body;
  const sql = 'INSERT INTO books (title, author, quantity) VALUES (?, ?, ?)';
  db.query(sql, [title, author, quantity], (err) => {
    if (err) {
      console.error('Error adding book:', err);
      return res.status(500).json({ error: 'Failed to add book' });
    }
    res.json({ message: '📚 Book added successfully!' });
  });
});

// ✅ Delete a book
// router.delete('/delete-book/:id', (req, res) => {
//   const bookId = req.params.id;
//   const sql = 'DELETE FROM books WHERE id = ?';
//   db.query(sql, [bookId], (err) => {
//     if (err) {
//       console.error('Error deleting book:', err);
//       return res.status(500).json({ error: 'Failed to delete book' });
//     }
//     res.json({ message: '🗑️ Book deleted successfully!' });
//   });
// });

// ✅ Update a book
router.put('/update-book/:id', (req, res) => {
  const bookId = req.params.id;
  const { title, author, quantity } = req.body;
  const sql = 'UPDATE books SET title = ?, author = ?, quantity = ? WHERE id = ?';
  db.query(sql, [title, author, quantity, bookId], (err) => {
    if (err) {
      console.error('Error updating book:', err);
      return res.status(500).json({ error: 'Failed to update book' });
    }
    res.json({ message: '✏️ Book updated successfully!' });
  });
});

// ✅ Get all borrowed books
router.get('/borrowed-books', (req, res) => {
  const sql = `
    SELECT 
      b.id AS borrow_id,
      u.username AS borrowed_by,
      bk.title AS book_title,
      b.borrow_date,
      b.return_date
    FROM borrowed_books b
    JOIN users u ON b.user_id = u.id
    JOIN books bk ON b.book_id = bk.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching borrowed books:', err);
      return res.status(500).json({ error: 'Failed to fetch borrowed books' });
    }
    res.json(results);
  });
});


// ✅ Admin handles book return
router.post('/return-book', (req, res) => {
  const { userId, bookId: customBookId } = req.body;

  // First, convert BOOK6 -> numeric id
  const getBookSql = 'SELECT id FROM books WHERE book_id = ?';
  db.query(getBookSql, [customBookId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found with given book ID' });
    }

    const numericBookId = result[0].id;

    // Proceed to mark it as returned
    const updateBorrowSql = `
      UPDATE borrowed_books 
      SET return_date = NOW(), status = 'returned' 
      WHERE user_id = ? AND book_id = ? AND status = 'borrowed'
    `;

    db.query(updateBorrowSql, [userId, numericBookId], (err, result) => {
      if (err) {
        console.error('Error updating return status:', err);
        return res.status(500).json({ success: false, message: 'Database error while returning book' });
      }

      // Optionally increase book quantity again
      const updateQtySql = 'UPDATE books SET quantity = quantity + 1 WHERE id = ?';
      db.query(updateQtySql, [numericBookId], () => {
        return res.json({ success: true, message: '📗 Book returned successfully!' });
      });
    });
  });
});


module.exports = router;
