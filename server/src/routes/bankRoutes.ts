import express from 'express';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

const router = express.Router();

// Мок-данные транзакций
const mockTransactions = [
  { description: 'Магазин продуктов', amount: 1500, type: 'expense', keywords: ['продукт', 'магазин'] },
  { description: 'Кафе', amount: 800, type: 'expense', keywords: ['кафе', 'ресторан'] },
  { description: 'Зарплата', amount: 50000, type: 'income', keywords: ['зарплата', 'зп'] },
  { description: 'Транспорт', amount: 300, type: 'expense', keywords: ['транспорт', 'такси'] },
  { description: 'Подработка', amount: 10000, type: 'income', keywords: ['подработка', 'фриланс'] },
];

// GET /api/bank/mock
router.get('/mock', async (req, res) => {
  try {
    // Для простоты возвращаем мок-транзакции, но в реальном сценарии здесь был бы запрос к банковскому API
    const categories = await Category.find();
    
    const transactions = mockTransactions.map(mock => {
      // Пытаемся найти подходящую категорию по ключевым словам
      let category = categories.find(c => 
        c.type === mock.type && 
        mock.keywords.some(k => c.name.toLowerCase().includes(k))
      );
      if (!category) {
        // Если не нашли, берём первую категорию расходов/доходов
        category = categories.find(c => c.type === mock.type);
      }
      return {
        amount: mock.amount,
        type: mock.type,
        category: category?._id,
        date: new Date(),
        description: mock.description,
      };
    });
    
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/bank/import
router.post('/import', async (req, res) => {
  try {
    const { transactions } = req.body; // ожидаем массив транзакций, подготовленных клиентом
    if (!transactions || !transactions.length) {
      return res.status(400).json({ message: 'No transactions to import' });
    }
    
    const created = [];
    for (const t of transactions) {
      const transaction = new Transaction({
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date,
        description: t.description,
      });
      await transaction.save();
      created.push(transaction);
    }
    res.json({ message: `Imported ${created.length} transactions`, transactions: created });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Import failed' });
  }
});

export default router;