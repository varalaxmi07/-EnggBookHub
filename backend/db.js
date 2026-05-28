const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // use your MySQL user
  password: 'Vara$007',      // your MySQL password
  database: 'library'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL Database');
});

module.exports = db;
