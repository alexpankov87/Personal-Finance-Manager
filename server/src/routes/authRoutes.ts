import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Category from '../models/Category';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ email, passwordHash, name });
    await user.save();

    // Создаём стандартные категории для нового пользователя
    const defaultCategories = [
      { name: 'Продукты', type: 'expense', color: '#6B7280', icon: 'restaurant-line', user: user._id },
      { name: 'Транспорт', type: 'expense', color: '#6B7280', icon: 'car-line', user: user._id },
      { name: 'Развлечения', type: 'expense', color: '#6B7280', icon: 'gamepad-line', user: user._id },
      { name: 'Зарплата', type: 'income', color: '#6B7280', icon: 'money-cny-box-line', user: user._id },
      { name: 'Подработка', type: 'income', color: '#6B7280', icon: 'briefcase-line', user: user._id },
    ];
    await Category.insertMany(defaultCategories);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, email, name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;