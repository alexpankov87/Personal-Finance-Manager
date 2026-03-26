import express from 'express';
import Transaction from '../models/Transaction';
import RecurringTransaction from '../models/RecurringTransaction';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const months = parseInt(req.query.months as string) || 3;
    const inflation = parseFloat(req.query.inflation as string) || 0.05;
    const period = (req.query.period as string) || 'month'; // month, quarter, year

    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - months);
    }

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startDate }
    }).populate('category');

    const monthlyTotals: { [key: string]: { income: number; expense: number } } = {};

    transactions.forEach(t => {
      const month = t.date.toISOString().slice(0, 7);
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyTotals[month].income += t.amount;
      } else {
        monthlyTotals[month].expense += t.amount;
      }
    });

    const monthsArray = Object.keys(monthlyTotals).sort();

    if (monthsArray.length === 0) {
      return res.json({
        currentMonth: { income: 0, expense: 0 },
        averageMonthly: { income: 0, expense: 0 },
        recurringNextMonth: { income: 0, expense: 0 },
        forecastNextMonth: { income: 0, expense: 0 },
        monthlyData: []
      });
    }

    let totalIncome = 0;
    let totalExpense = 0;
    monthsArray.forEach(m => {
      totalIncome += monthlyTotals[m]?.income || 0;
      totalExpense += monthlyTotals[m]?.expense || 0;
    });
    const avgIncome = totalIncome / monthsArray.length;
    const avgExpense = totalExpense / monthsArray.length;

    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    const nextMonthEnd = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);

    const recurring = await RecurringTransaction.find({
      user: userId,
      active: true,
      nextRun: { $lte: nextMonthEnd }
    }).populate('category');

    let recurringIncome = 0;
    let recurringExpense = 0;
    recurring.forEach(r => {
      if (r.type === 'income') recurringIncome += r.amount;
      else recurringExpense += r.amount;
    });

    const forecastIncome = avgIncome * (1 + inflation) + recurringIncome;
    const forecastExpense = avgExpense * (1 + inflation) + recurringExpense;

    const lastMonthKey = monthsArray[monthsArray.length - 1];
    const lastMonthData = lastMonthKey && monthlyTotals[lastMonthKey]
      ? monthlyTotals[lastMonthKey]
      : { income: 0, expense: 0 };

    // Подготовка данных для барчарта
    const monthlyData = monthsArray.map(month => ({
      month,
      income: monthlyTotals[month]?.income ?? 0,
      expense: monthlyTotals[month]?.expense ?? 0,
    }));

    res.json({
      currentMonth: {
        income: lastMonthData.income,
        expense: lastMonthData.expense,
      },
      averageMonthly: { income: avgIncome, expense: avgExpense },
      recurringNextMonth: { income: recurringIncome, expense: recurringExpense },
      forecastNextMonth: { income: forecastIncome, expense: forecastExpense },
      monthlyData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;