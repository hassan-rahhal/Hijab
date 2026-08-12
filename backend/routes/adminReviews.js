import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/admin/reviews — every review, newest first, with the product name attached
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, p.name AS product_name, p.slug AS product_slug
       FROM reviews r
       JOIN products p ON p.id = r.product_id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// DELETE /api/admin/reviews/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
