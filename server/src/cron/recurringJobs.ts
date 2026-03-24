import RecurringTransaction from '../models/RecurringTransaction';
import Transaction from '../models/Transaction';

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86400000);
const addMonths = (date: Date, months: number) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

export const processRecurringTransactions = async () => {
  const now = new Date();
  const recurring = await RecurringTransaction.find({ active: true, nextRun: { $lte: now } }).populate('category');
  
  for (const item of recurring) {
    // Вычисляем следующую дату
    let nextRun: Date;
    switch (item.period) {
      case 'daily': nextRun = addDays(now, 1); break;
      case 'weekly': nextRun = addDays(now, 7); break;
      case 'monthly': nextRun = addMonths(now, 1); break;
      default: nextRun = addDays(now, 1);
    }

    // Атомарно обновляем запись, только если nextRun не изменился
    const updated = await RecurringTransaction.findOneAndUpdate(
        { _id: item._id, nextRun: item.nextRun },
        { $set: { nextRun } },
        { returnDocument: 'after' }  
    );

    if (updated) {
      // Создаём транзакцию только если удалось обновить
      const transaction = new Transaction({
        amount: item.amount,
        type: item.type,
        category: item.category._id,
        date: now,
        description: item.description ? `${item.description} (повторяющаяся)` : 'Повторяющаяся операция',
      });
      await transaction.save();
      console.log(`Created transaction from recurring ${item._id}`);
    } else {
      console.log(`Skipped recurring ${item._id}, nextRun changed concurrently`);
    }
  }
};