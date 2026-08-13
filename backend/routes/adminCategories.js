import { Router } from 'express';
import pool from '../db.js';

const router = Router();

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// GET /api/admin/categories
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/admin/categories
router.post('/', async (req, res) => {
  try {
    const { name, sortOrder = 0 } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)',
      [name, slugify(name), sortOrder]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: `A category named "${req.body.name}" already exists` });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/admin/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, sortOrder } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    await pool.query(
      'UPDATE categories SET name = ?, slug = ?, sort_order = ? WHERE id = ?',
      [name, slugify(name), sortOrder ?? 0, req.params.id]
    );
    res.json({ message: 'Category updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/admin/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    // Most likely cause: products still reference this category (FK constraint)
    res.status(500).json({ error: 'Failed to delete — make sure no products use this category first' });
  }
});

export default router;
