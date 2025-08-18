const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');



const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const port = 3000;

// MySQL connection
const db = mysql.createConnection({
    host: 'testdb-1.cp24ccc4chcf.ap-southeast-1.rds.amazonaws.com',
    user: 'root',
    password: 'py4rVk]cJx:(,^Y*8w97',
    database: 'testdb-1' // ✅ Use actual DB name, avoid using instance ID
});

// Connect to MySQL
db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create table
app.get('/createTable', (req, res) => {
    let sql = 'CREATE TABLE IF NOT EXISTS items(id INT AUTO_INCREMENT, name VARCHAR(255), PRIMARY KEY(id))';
    db.query(sql, (err) => {
        if (err) throw err;
        res.send('Items table created...');
    });
});

// Add item
app.post('/addItem', (req, res) => {
    let item = { name: req.body.name };
    let sql = 'INSERT INTO items SET ?';
    db.query(sql, item, (err) => {
        if (err) throw err;
        res.send('Item added...');
    });
});

// Get all items
app.get('/getItems', (req, res) => {
    let sql = 'SELECT * FROM items';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Get item by ID
app.get('/getItem/:id', (req, res) => {
    let sql = `SELECT * FROM items WHERE id = ?`;
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Update item
app.put('/updateItem/:id', (req, res) => {
    let sql = `UPDATE items SET name = ? WHERE id = ?`;
    db.query(sql, [req.body.name, req.params.id], (err) => {
        if (err) throw err;
        res.send('Item updated...');
    });
});

// Delete item
app.delete('/deleteItem/:id', (req, res) => {
    let sql = `DELETE FROM items WHERE id = ?`;
    db.query(sql, [req.params.id], (err) => {
        if (err) throw err;
        res.send('Item deleted...');
    });
});


// 🔹 NEW FEATURES 🔹

// 1. Search items by name
app.get('/search/:name', (req, res) => {
    let sql = `SELECT * FROM items WHERE name LIKE ?`;
    db.query(sql, [`%${req.params.name}%`], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// 2. Count total items
app.get('/countItems', (req, res) => {
    let sql = `SELECT COUNT(*) AS total FROM items`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result[0]);
    });
});

// 3. Get items with pagination
app.get('/itemsPage', (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 5;
    let offset = (page - 1) * limit;

    let sql = `SELECT * FROM items LIMIT ? OFFSET ?`;
    db.query(sql, [limit, offset], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// 4. Delete all items
app.delete('/clearItems', (req, res) => {
    let sql = `DELETE FROM items`;
    db.query(sql, (err) => {
        if (err) throw err;
        res.send('All items deleted...');
    });
});

// 5. Sort items
app.get('/sortItems/:field', (req, res) => {
    let field = req.params.field;
    if (!['id', 'name'].includes(field)) {
        return res.status(400).send('Invalid sort field');
    }
    let sql = `SELECT * FROM items ORDER BY ${field} ASC`;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});


// Start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

