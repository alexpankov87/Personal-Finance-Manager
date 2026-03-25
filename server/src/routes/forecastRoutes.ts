import express from 'express';
import Transaction from '../models/Transaction';
import RecurringTransaction from '../models/RecurringTransaction';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const months = parseInt(req.query.months as string) || 3;
    const inflation = parseFloat(req.query.inflation as string) || 0.05;

    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - months);

    const transactions = await Transaction.find({
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
      return res.json({ income: 0, expense: 0, nextMonth: null });
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
    // Безопасное получение данных последнего месяца
    const lastMonthData = (lastMonthKey && monthlyTotals[lastMonthKey]) 
      ? monthlyTotals[lastMonthKey] 
      : { income: 0, expense: 0 };

    res.json({
      currentMonth: {
        income: lastMonthData.income,
        expense: lastMonthData.expense,
      },
      averageMonthly: { income: avgIncome, expense: avgExpense },
      recurringNextMonth: { income: recurringIncome, expense: recurringExpense },
      forecastNextMonth: { income: forecastIncome, expense: forecastExpense },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;