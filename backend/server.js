import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import reviewsRouter from './routes/reviews.js';

import adminAuthRouter from './routes/adminAuth.js';
import adminOrdersRouter from './routes/adminOrders.js';
import adminProductsRouter from './routes/adminProducts.js';
import adminCategoriesRouter from './routes/adminCategories.js';
import adminReviewsRouter from './routes/adminReviews.js';
import uploadRouter from './routes/upload.js';
import { requireAdmin } from './middleware/requireAdmin.js';

dotenv.config();

const app = express();

app.use(cors());        // allows your React dev server (port 5173) to call this API
app.use(express.json());

// Serve uploaded product photos at /uploads/filename.jpg
// Uses __dirname (this file's own folder) instead of process.cwd() — cwd can
// vary depending on where PM2 was launched from, which caused 404s otherwise.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Public routes ----------
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reviews', reviewsRouter);

// ---------- Admin routes ----------
app.use('/api/admin/login', adminAuthRouter);              // no auth needed to log in
app.use('/api/admin/orders', requireAdmin, adminOrdersRouter);
app.use('/api/admin/products', requireAdmin, adminProductsRouter);
app.use('/api/admin/categories', requireAdmin, adminCategoriesRouter);
app.use('/api/admin/reviews', requireAdmin, adminReviewsRouter);
app.use('/api/admin/upload', requireAdmin, uploadRouter);

app.get('/', (req, res) => {
  res.send('Hijab Home API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
