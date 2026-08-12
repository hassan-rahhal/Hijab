import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const SORT_OPTIONS = {
  newest: 'p.created_at DESC',
  'price-asc': 'p.price ASC',
  'price-desc': 'p.price DESC',
  'name-asc': 'p.name ASC',
  'name-desc': 'p.name DESC',
};

// A product is "in stock" if: it has no sizes defined OR at least one size is in stock,
// AND it has no colors defined OR at least one color is in stock.
function computeInStock(sizes, colors) {
  const sizesOk = sizes.length === 0 || sizes.some((s) => s.in_stock);
  const colorsOk = colors.length === 0 || colors.some((c) => c.in_stock);
  return sizesOk && colorsOk;
}

// GET /api/products — all active products, optional ?category=slug&sort=price-asc
router.get('/', async (req, res) => {
  try {
    const { category, sort } = req.query;

    let sql = `
      SELECT p.id, p.name, p.slug, p.description, p.price, p.image_url,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = 1
    `;
    const params = [];
    if (category) { sql += ' AND c.slug = ?'; params.push(category); }

    const orderBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
    sql += ` ORDER BY ${orderBy}`;

    const [products] = await pool.query(sql, params);
    if (products.length === 0) return res.json([]);

    const ids = products.map((p) => p.id);
    const [sizes] = await pool.query('SELECT product_id, in_stock FROM product_sizes WHERE product_id IN (?)', [ids]);
    const [colors] = await pool.query('SELECT product_id, in_stock FROM product_colors WHERE product_id IN (?)', [ids]);

    const withStock = products.map((p) => ({
      ...p,
      inStock: computeInStock(
        sizes.filter((s) => s.product_id === p.id),
        colors.filter((c) => c.product_id === p.id)
      ),
    }));

    res.json(withStock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:slug — single product detail, including sizes, colors, and gallery
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.slug = ? AND p.is_active = 1`,
      [req.params.slug]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const product = rows[0];

    const [sizes] = await pool.query('SELECT size, in_stock AS inStock FROM product_sizes WHERE product_id = ?', [product.id]);
    const [colors] = await pool.query('SELECT name, hex, in_stock AS inStock FROM product_colors WHERE product_id = ?', [product.id]);
    const [extraImages] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [product.id]);

    // Gallery = cover photo first, then any additional photos (deduplicated)
    const images = [product.image_url, ...extraImages.map((i) => i.image_url)].filter(Boolean);
    const uniqueImages = [...new Set(images)];

    product.sizes = sizes;
    product.colors = colors;
    product.images = uniqueImages;
    product.inStock = computeInStock(
      sizes.map((s) => ({ in_stock: s.inStock })),
      colors.map((c) => ({ in_stock: c.inStock }))
    );

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
