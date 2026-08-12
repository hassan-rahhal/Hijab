import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// POST /api/orders — place an order from whatever is currently in this session's cart
router.post('/', async (req, res) => {
  const { sessionId, fullName, email, phone, address, city, notes } = req.body;

  if (!sessionId || !fullName || !email || !phone || !address || !city) {
    return res.status(400).json({ error: 'fullName, email, phone, address, city, and sessionId are all required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [cartRows] = await connection.query('SELECT id FROM carts WHERE session_id = ?', [sessionId]);
    if (cartRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'No cart found for this session' });
    }
    const cartId = cartRows[0].id;

    const [items] = await connection.query(
      `SELECT ci.product_id, ci.size, ci.color, ci.quantity, p.name, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    if (items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

    const [orderResult] = await connection.query(
      `INSERT INTO orders (session_id, full_name, email, phone, address, city, notes, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, fullName, email, phone, address, city, notes || null, total.toFixed(2)]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, size, color, quantity, price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.size, item.color, item.quantity, item.price]
      );
    }

    // Order placed — empty the cart. Stock availability is managed manually by
    // the admin (in/out toggle per size and color), not auto-decremented here.
    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await connection.commit();
    res.status(201).json({ orderId, total: Number(total.toFixed(2)) });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    connection.release();
  }
});

// GET /api/orders/:id — order confirmation details
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    res.json({ ...orders[0], items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
