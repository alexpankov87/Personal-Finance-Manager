import express from 'express';
import RecurringTransaction from '../models/RecurringTransaction';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

// GET /api/recurring
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const recurring = await RecurringTransaction.find({ user: userId }).populate('category');
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/recurring
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { amount, type, category, description, period, nextRun } = req.body;
    const recurring = new RecurringTransaction({
      amount,
      type,
      category,
      description,
      period,
      nextRun,
      user: userId,
    });
    await recurring.save();
    await recurring.populate('category');
    res.status(201).json(recurring);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// PUT /api/recurring/:id
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Invalid ID' });
    const recurring = await RecurringTransaction.findOneAndUpdate(
      { _id: id, user: userId },
      req.body,
      { new: true }
    ).populate('category');
    if (!recurring) return res.status(404).json({ message: 'Not found' });
    res.json(recurring);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// DELETE /api/recurring/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Invalid ID' });
    const recurring = await RecurringTransaction.findOneAndDelete({ _id: id, user: userId });
    if (!recurring) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;