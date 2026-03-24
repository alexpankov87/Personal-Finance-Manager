import express from 'express';
import RecurringTransaction from '../models/RecurringTransaction';

const router = express.Router();

// GET /api/recurring
router.get('/', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.find().populate('category');
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/recurring
router.post('/', async (req, res) => {
  try {
    const { amount, type, category, description, period, nextRun } = req.body;
    const recurring = new RecurringTransaction({ amount, type, category, description, period, nextRun });
    await recurring.save();
    await recurring.populate('category');
    res.status(201).json(recurring);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// PUT /api/recurring/:id
router.put('/:id', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category');
    if (!recurring) return res.status(404).json({ message: 'Not found' });
    res.json(recurring);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// DELETE /api/recurring/:id
router.delete('/:id', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findByIdAndDelete(req.params.id);
    if (!recurring) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;