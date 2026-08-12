import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/admin/orders — all orders, newest first, with their items
router.get('/', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const [items] = await pool.query('SELECT * FROM order_items');

    const withItems = orders.map((order) => ({
      ...order,
      items: items.filter((i) => i.order_id === order.id),
    }));

    res.json(withItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PATCH /api/admin/orders/:id — update status and/or delivery charge
router.patch('/:id', async (req, res) => {
  try {
    const { status, deliveryCharge } = req.body;
    const fields = [];
    const params = [];

    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (deliveryCharge !== undefined) { fields.push('delivery_charge = ?'); params.push(deliveryCharge); }

    if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update' });

    params.push(req.params.id);
    await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, params);

    res.json({ message: 'Order updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE /api/admin/orders/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;
