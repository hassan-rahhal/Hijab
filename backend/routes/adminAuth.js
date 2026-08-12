import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /api/admin/login
router.post('/', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
      console.error('Admin login is missing config: check ADMIN_USERNAME, ADMIN_PASSWORD, and JWT_SECRET in backend/.env');
      return res.status(500).json({ error: 'Admin login is not configured on the server yet' });
    }

    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
      // Deliberately vague error — don't reveal whether username or password was wrong
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed due to a server error' });
  }
});

export default router;
