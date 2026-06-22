const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin: get dashboard stats (filtered by restaurant)
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  const rid = req.user.restaurantId;

  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM orders WHERE restaurant_id = ?) as totalOrders,
      (SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE restaurant_id = ? AND status != 'cancelled') as totalRevenue,
      (SELECT COUNT(*) FROM orders WHERE restaurant_id = ? AND status IN ('pending', 'preparing')) as activeOrders,
      (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = ?) as totalMenuItems
  `;

  db.get(sql, [rid, rid, rid, rid], (err, row) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(row || { totalOrders: 0, totalRevenue: 0, activeOrders: 0, totalMenuItems: 0 });
  });
});

// Admin: get restaurant info
router.get('/restaurant', authenticateToken, requireAdmin, (req, res) => {
  const rid = req.user.restaurantId;
  db.get('SELECT id, name, description, image FROM restaurants WHERE id = ?', [rid], (err, row) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(row || {});
  });
});

// Admin: list orders for this restaurant
router.get('/orders', authenticateToken, requireAdmin, (req, res) => {
  const rid = req.user.restaurantId;

  const sql = `
    SELECT o.*, u.name AS user_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.restaurant_id = ?
    ORDER BY o.created_at DESC
  `;

  db.all(sql, [rid], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(results || []);
  });
});

// Admin: update order status (only own restaurant's orders)
router.put('/orders/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const rid = req.user.restaurantId;

  if (!status) return res.status(400).json({ message: 'Status is required' });

  db.run('UPDATE orders SET status = ? WHERE id = ? AND restaurant_id = ?', [status, id, rid], function(err) {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (this.changes === 0) return res.status(404).json({ message: 'Order not found or not yours' });
    res.json({ message: 'Order status updated' });
  });
});

// Admin: create menu item (for own restaurant)
router.post('/menu', authenticateToken, requireAdmin, (req, res) => {
  const rid = req.user.restaurantId;
  const { name, description, price, image_url } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  db.run(
    'INSERT INTO menu_items (restaurant_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
    [rid, name, description || '', price, image_url || ''],
    function(err) {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(201).json({ id: this.lastID, restaurant_id: rid, name, price });
    }
  );
});

// Admin: get menu items (for own restaurant)
router.get('/menu', authenticateToken, requireAdmin, (req, res) => {
  const rid = req.user.restaurantId;
  db.all('SELECT * FROM menu_items WHERE restaurant_id = ?', [rid], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(rows || []);
  });
});

// Admin: update menu item (verify ownership)
router.put('/menu/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const rid = req.user.restaurantId;
  const { name, description, price, image_url } = req.body;

  db.run(
    'UPDATE menu_items SET name = ?, description = ?, price = ?, image_url = ? WHERE id = ? AND restaurant_id = ?',
    [name, description, price, image_url, id, rid],
    function(err) {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      if (this.changes === 0) return res.status(404).json({ message: 'Menu item not found' });
      res.json({ message: 'Menu item updated' });
    }
  );
});

// Admin: delete menu item (verify ownership)
router.delete('/menu/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const rid = req.user.restaurantId;

  db.run('DELETE FROM menu_items WHERE id = ? AND restaurant_id = ?', [id, rid], function(err) {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (this.changes === 0) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Menu item deleted' });
  });
});

// ═══════════════════════════════════════════════════════
// ANALYTICS ENDPOINTS
// ═══════════════════════════════════════════════════════

// Analytics: overview stats
router.get('/analytics/overview', authenticateToken, requireAdmin, (req, res) => {
  const rid = req.user.restaurantId;

  const sql = `
    SELECT 
      COUNT(*) as totalOrders,
      COALESCE(SUM(total_price), 0) as totalRevenue,
      COALESCE(AVG(total_price), 0) as avgOrderValue,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as deliveredOrders,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingOrders
    FROM orders WHERE restaurant_id = ?
  `;

  db.get(sql, [rid], (err, row) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(row || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 });
  });
});

// Analytics: orders per day (last 7 days)
router.get('/analytics/daily', authenticateToken, requireAdmin, (req, res) => {
  const rid = req.user.restaurantId;

  const sql = `
    SELECT 
      date(created_at) as date,
      COUNT(*) as orders,
      COALESCE(SUM(total_price), 0) as revenue
    FROM orders 
    WHERE restaurant_id = ? AND created_at >= date('now', '-7 days')
    GROUP BY date(created_at)
    ORDER BY date ASC
  `;

  db.all(sql, [rid], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    // Fill in missing days with zeros
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const existing = (rows || []).find(r => r.date === dateStr);
      result.push({
        date: dateStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        orders: existing ? existing.orders : 0,
        revenue: existing ? existing.revenue : 0
      });
    }

    res.json(result);
  });
});

// Analytics: top selling items
router.get('/analytics/top-items', authenticateToken, requireAdmin, (req, res) => {
  const rid = req.user.restaurantId;

  const sql = `
    SELECT 
      mi.name,
      SUM(oi.quantity) as totalSold,
      SUM(oi.price * oi.quantity) as totalRevenue
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.restaurant_id = ?
    GROUP BY mi.id
    ORDER BY totalSold DESC
    LIMIT 5
  `;

  db.all(sql, [rid], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(rows || []);
  });
});

// Analytics: order status breakdown
router.get('/analytics/status-breakdown', authenticateToken, requireAdmin, (req, res) => {
  const rid = req.user.restaurantId;

  const sql = `
    SELECT 
      status,
      COUNT(*) as count
    FROM orders 
    WHERE restaurant_id = ?
    GROUP BY status
  `;

  db.all(sql, [rid], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(rows || []);
  });
});

// Analytics: customers who ordered from this restaurant
router.get('/analytics/customers', authenticateToken, requireAdmin, (req, res) => {
  const rid = req.user.restaurantId;

  const sql = `
    SELECT 
      u.id, u.name, u.email,
      COUNT(o.id) as orderCount,
      COALESCE(SUM(o.total_price), 0) as totalSpent,
      MAX(o.created_at) as lastOrder
    FROM users u
    JOIN orders o ON u.id = o.user_id
    WHERE o.restaurant_id = ?
    GROUP BY u.id
    ORDER BY totalSpent DESC
    LIMIT 20
  `;

  db.all(sql, [rid], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(rows || []);
  });
});

module.exports = router;
