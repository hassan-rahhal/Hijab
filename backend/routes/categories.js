import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/categories — list all categories, ordered for the homepage grid
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, slug, image_url, sort_order FROM categories ORDER BY sort_order ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
