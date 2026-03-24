import express from 'express';
import Transaction from '../models/Transaction';

const router = express.Router();

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('category');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { amount, type, category, date, description } = req.body;
    const transaction = new Transaction({ amount, type, category, date, description });
    await transaction.save();
    const populated = await transaction.populate('category');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/transactions/:id (обновление, опционально)
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

export default router;