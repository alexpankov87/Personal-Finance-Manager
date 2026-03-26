import express from 'express';
import Transaction from '../models/Transaction';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

// GET /api/transactions
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const transactions = await Transaction.find({ user: userId }).populate('category');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/transactions
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { amount, type, category, date, description } = req.body;
    const transaction = new Transaction({ amount, type, category, date, description, user: userId });
    await transaction.save();
    const populated = await transaction.populate('category');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Invalid ID' });
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: userId },
      req.body,
      { new: true }
    ).populate('category');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Invalid ID' });
    const transaction = await Transaction.findOneAndDelete({ _id: id, user: userId });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;