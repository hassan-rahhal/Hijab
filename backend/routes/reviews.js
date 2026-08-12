import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/reviews/:productId — all reviews for a product, plus the average rating
router.get('/:productId', async (req, res) => {
  try {
    const [reviews] = await pool.query(
      'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [req.params.productId]
    );
    const average = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({ reviews, average: Number(average.toFixed(1)), count: reviews.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews/:productId — submit a new review
router.post('/:productId', async (req, res) => {
  try {
    const { customerName, rating, comment } = req.body;
    if (!customerName || !rating) {
      return res.status(400).json({ error: 'customerName and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    await pool.query(
      'INSERT INTO reviews (product_id, customer_name, rating, comment) VALUES (?, ?, ?, ?)',
      [req.params.productId, customerName, rating, comment || null]
    );
    res.status(201).json({ message: 'Review submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
