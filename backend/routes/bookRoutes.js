const express = require('express');
const router = express.Router();
const db = require('../db'); // corrected path
const verifyToken = require('../middleware/verifyToken'); 

// Add a new book
router.post('/add-book', (req, res) => {
  const { book_id, title, author, quantity, coverpage, department } = req.body;

  const sql = `
    INSERT INTO books (book_id, title, author, quantity, coverpage, department)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [book_id, title, author, quantity, coverpage, department], (err, result) => {
    if (err) {
      console.error('❌ Error adding book:', err);
      res.status(500).json({ message: 'Error adding book' });
    } else {
      res.status(200).json({ message: 'Book added successfully' });
    }
  });
});

// Remove a book
router.delete('/delete-book/:id', (req, res) => {
  const bookId = req.params.id;
  const sql = 'DELETE FROM books WHERE id = ?';
  db.query(sql, [bookId], (err, result) => {
    if (err) {
      console.error('❌ Error deleting book:', err);
      return res.status(500).send('Error deleting book');
    }
    res.status(200).send('✅ Book deleted successfully');
  });
});

// Get available books (optionally filter by department)
router.get('/available', (req, res) => {
  const { department, search } = req.query; // ✅ define search

  let sql = 'SELECT * FROM books WHERE quantity > 0';
  const params = [];

  if (department) {
    sql += ' AND department = ?';
    params.push(department);
  }

  if (search) {
    sql += ' AND (title LIKE ? OR author LIKE ? OR book_id LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('❌ Error fetching available books:', err);
      return res.status(500).json({ message: 'Error fetching books' });
    }
    res.json(rows);
  });
});

// Search for books by title, author, or book_id
router.get('/search', (req, res) => {
  const { query, department } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  let sql = 'SELECT * FROM books WHERE (title LIKE ? OR author LIKE ?)';
  const params = [`%${query}%`, `%${query}%`];

  // If query is numeric, treat it as book_id and do an exact match
  if (!isNaN(query)) {
    sql += ' OR book_id = ?'; // Exact match for book_id
    params.push(query); // No need for wildcard for exact match
  } else {
    sql += ' OR book_id LIKE ?'; // Partial match for book_id
    params.push(`%${query}%`);
  }

  if (department) {
    sql += ' AND department = ?';
    params.push(department);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('❌ Error searching books:', err);
      return res.status(500).json({ error: 'Failed to search books' });
    }
    res.json(results);
  });
});

// Borrow a book (assuming you have a middleware to verify token)
router.post('/borrow', verifyToken, (req, res) => {
  const userId = req.user.id;
  const bookId = req.body.bookId;

  // 1. Insert into borrowed_books
  const sql = `
    INSERT INTO borrowed_books (user_id, book_id, borrow_date, due_date, status)
    VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'borrowed')
  `;

  db.query(sql, [userId, bookId], (err, result) => {
    if (err) {
      console.error('❌ Error inserting borrowed book:', err);
      return res.status(500).json({ message: 'Error borrowing book' });
    }

    // 2. Reduce quantity in books table
    const updateSql = `UPDATE books SET quantity = quantity - 1 WHERE id = ? AND quantity > 0`;

    db.query(updateSql, [bookId], (err2, result2) => {
      if (err2) {
        console.error('❌ Error updating book quantity:', err2);
        return res.status(500).json({ message: 'Book borrowed but failed to update quantity' });
      }

      res.status(200).json({ message: '✅ Book borrowed successfully' });
    });
  });
});

module.exports = router;
