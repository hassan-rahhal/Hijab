import { Router } from 'express';
import pool from '../db.js';

const router = Router();

async function getOrCreateCart(sessionId) {
  const [existing] = await pool.query('SELECT id FROM carts WHERE session_id = ?', [sessionId]);
  if (existing.length > 0) return existing[0].id;
  const [result] = await pool.query('INSERT INTO carts (session_id) VALUES (?)', [sessionId]);
  return result.insertId;
}

// GET /api/cart/:sessionId
router.get('/:sessionId', async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.params.sessionId);

    const [items] = await pool.query(
      `SELECT ci.product_id, ci.size, ci.color, ci.quantity, p.name, p.price, p.image_url,
              c.name AS category_name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       JOIN categories c ON c.id = p.category_id
       WHERE ci.cart_id = ?
       ORDER BY ci.created_at DESC`,
      [cartId]
    );

    const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    res.json({ items, total: Number(total.toFixed(2)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart/:sessionId — body: { productId, size, color, quantity }
router.post('/:sessionId', async (req, res) => {
  try {
    const { productId, size = 'One Size', color = 'Default', quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const cartId = await getOrCreateCart(req.params.sessionId);

    await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, size, color, quantity)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [cartId, productId, size, color, quantity]
    );

    res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// PUT /api/cart/:sessionId/item/:productId?size=M&color=Black
router.put('/:sessionId/item/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const size = req.query.size || 'One Size';
    const color = req.query.color || 'Default';
    if (quantity === undefined) return res.status(400).json({ error: 'quantity is required' });

    const cartId = await getOrCreateCart(req.params.sessionId);

    if (quantity <= 0) {
      await pool.query(
        'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ? AND size = ? AND color = ?',
        [cartId, req.params.productId, size, color]
      );
    } else {
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ? AND size = ? AND color = ?',
        [quantity, cartId, req.params.productId, size, color]
      );
    }

    res.json({ message: 'Cart updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// DELETE /api/cart/:sessionId/item/:productId?size=M&color=Black
router.delete('/:sessionId/item/:productId', async (req, res) => {
  try {
    const size = req.query.size || 'One Size';
    const color = req.query.color || 'Default';
    const cartId = await getOrCreateCart(req.params.sessionId);
    await pool.query(
      'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ? AND size = ? AND color = ?',
      [cartId, req.params.productId, size, color]
    );
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

export default router;
