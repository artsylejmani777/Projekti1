import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─── Database ───────────────────────────────────────────
const db = new Database(join(__dirname, 'orders.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT    NOT NULL,
    email         TEXT    NOT NULL,
    phone         TEXT    NOT NULL,
    address       TEXT    NOT NULL,
    part_name     TEXT    NOT NULL,
    quantity      INTEGER NOT NULL DEFAULT 1,
    total_price   REAL    NOT NULL,
    status        TEXT    NOT NULL DEFAULT 'Pending',
    notes         TEXT    DEFAULT '',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  )
`);

// ─── API Routes ─────────────────────────────────────────

// Get all orders (with optional status filter)
app.get('/api/orders', (req, res) => {
  try {
    const { status } = req.query;
    let rows;
    if (status) {
      rows = db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY id DESC').all(status);
    } else {
      rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    }
    res.json({ success: true, orders: rows, count: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single order
app.get('/api/orders/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order: row });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new order
app.post('/api/orders', (req, res) => {
  try {
    const { customer_name, email, phone, address, part_name, quantity, total_price, notes } = req.body;

    // Validation
    if (!customer_name || !email || !phone || !address || !part_name || !quantity || !total_price) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO orders (customer_name, email, phone, address, part_name, quantity, total_price, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      customer_name, email, phone, address, part_name,
      Number(quantity), Number(total_price), notes || ''
    );

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status.' });
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Stats
app.get('/api/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    const revenue = db.prepare('SELECT SUM(total_price) as total FROM orders').get();
    const byStatus = db.prepare(
      'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
    ).all();
    res.json({ success: true, totalOrders: total.count, totalRevenue: revenue.total || 0, byStatus });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Start ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/orders`);
});
