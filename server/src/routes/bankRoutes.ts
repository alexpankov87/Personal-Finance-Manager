import express from 'express';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authMiddleware);

// Мок-данные транзакций
const mockTransactions = [
  { description: 'Магазин продуктов', amount: 1500, type: 'expense', keywords: ['продукт', 'магазин'] },
  { description: 'Кафе', amount: 800, type: 'expense', keywords: ['кафе', 'ресторан'] },
  { description: 'Зарплата', amount: 50000, type: 'income', keywords: ['зарплата', 'зп'] },
  { description: 'Транспорт', amount: 300, type: 'expense', keywords: ['транспорт', 'такси'] },
  { description: 'Подработка', amount: 10000, type: 'income', keywords: ['подработка', 'фриланс'] },
];

// GET /api/bank/mock
router.get('/mock', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const categories = await Category.find({ user: userId });
    
    const transactions = mockTransactions.map(mock => {
      let category = categories.find(c => 
        c.type === mock.type && 
        mock.keywords.some(k => c.name.toLowerCase().includes(k))
      );
      if (!category) {
        category = categories.find(c => c.type === mock.type);
      }
      return {
        amount: mock.amount,
        type: mock.type,
        category: category?._id,
        date: new Date(),
        description: mock.description,
        user: userId, 
      };
    });
    
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/bank/import
router.post('/import', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    
    const { transactions } = req.body;
    if (!transactions || !transactions.length) {
      return res.status(400).json({ message: 'No transactions to import' });
    }
    
    const created = [];
    for (const t of transactions) {
      // Проверяем, есть ли уже такая транзакция за последние 24 часа
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const existing = await Transaction.findOne({
        user: userId,
        amount: t.amount,
        type: t.type,
        category: t.category,
        description: t.description,
        date: { $gte: yesterday }
      });
      
      if (!existing) {
        const transaction = new Transaction({
          amount: t.amount,
          type: t.type,
          category: t.category,
          date: t.date,
          description: t.description,
          user: userId,
        });
        await transaction.save();
        created.push(transaction);
      }
    }
    
    res.json({ 
      message: `Imported ${created.length} new transactions`, 
      transactions: created,
      skipped: transactions.length - created.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Import failed' });
  }
});

export default router;