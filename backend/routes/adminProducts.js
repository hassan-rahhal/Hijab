import { Router } from 'express';
import pool from '../db.js';

const router = Router();

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// GET /api/admin/products — everything, including sizes/colors/gallery, for the admin table
router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM products p
       JOIN categories c ON c.id = p.category_id
       ORDER BY p.created_at DESC`
    );
    const [sizes] = await pool.query('SELECT * FROM product_sizes');
    const [colors] = await pool.query('SELECT * FROM product_colors');
    const [images] = await pool.query('SELECT * FROM product_images ORDER BY sort_order ASC');

    const withDetails = products.map((p) => ({
      ...p,
      sizes: sizes.filter((s) => s.product_id === p.id),
      colors: colors.filter((c) => c.product_id === p.id),
      images: images.filter((i) => i.product_id === p.id).map((i) => i.image_url),
    }));

    res.json(withDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/admin/products
// body: { name, categoryId, price, description, imageUrl, sizes: [{size, inStock}],
//         colors: [{name, hex, inStock}], images: [url, url, ...] }
router.post('/', async (req, res) => {
  const { name, categoryId, price, description, imageUrl, sizes = [], colors = [], images = [] } = req.body;
  if (!name || !categoryId || price === undefined) {
    return res.status(400).json({ error: 'name, categoryId, and price are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO products (category_id, name, slug, description, price, stock, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, 0, ?, 1)`,
      [categoryId, name, slugify(name) + '-' + Date.now(), description || null, price, imageUrl || null]
    );
    const productId = result.insertId;

    for (const s of sizes) {
      await connection.query(
        'INSERT INTO product_sizes (product_id, size, in_stock) VALUES (?, ?, ?)',
        [productId, s.size, s.inStock ? 1 : 0]
      );
    }
    for (const c of colors) {
      await connection.query(
        'INSERT INTO product_colors (product_id, name, hex, in_stock) VALUES (?, ?, ?, ?)',
        [productId, c.name, c.hex || null, c.inStock ? 1 : 0]
      );
    }
    for (let i = 0; i < images.length; i++) {
      await connection.query(
        'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
        [productId, images[i], i]
      );
    }

    await connection.commit();
    res.status(201).json({ id: productId });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  } finally {
    connection.release();
  }
});

// PUT /api/admin/products/:id — update details and replace sizes/colors/images wholesale
router.put('/:id', async (req, res) => {
  const { name, categoryId, price, description, imageUrl, isActive, sizes, colors, images } = req.body;
  const productId = req.params.id;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (categoryId !== undefined) { fields.push('category_id = ?'); params.push(categoryId); }
    if (price !== undefined) { fields.push('price = ?'); params.push(price); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (imageUrl !== undefined) { fields.push('image_url = ?'); params.push(imageUrl); }
    if (isActive !== undefined) { fields.push('is_active = ?'); params.push(isActive ? 1 : 0); }

    if (fields.length > 0) {
      params.push(productId);
      await connection.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    if (Array.isArray(sizes)) {
      await connection.query('DELETE FROM product_sizes WHERE product_id = ?', [productId]);
      for (const s of sizes) {
        await connection.query(
          'INSERT INTO product_sizes (product_id, size, in_stock) VALUES (?, ?, ?)',
          [productId, s.size, s.inStock ? 1 : 0]
        );
      }
    }

    if (Array.isArray(colors)) {
      await connection.query('DELETE FROM product_colors WHERE product_id = ?', [productId]);
      for (const c of colors) {
        await connection.query(
          'INSERT INTO product_colors (product_id, name, hex, in_stock) VALUES (?, ?, ?, ?)',
          [productId, c.name, c.hex || null, c.inStock ? 1 : 0]
        );
      }
    }

    if (Array.isArray(images)) {
      await connection.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
      for (let i = 0; i < images.length; i++) {
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
          [productId, images[i], i]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Product updated' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  } finally {
    connection.release();
  }
});

// DELETE /api/admin/products/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
