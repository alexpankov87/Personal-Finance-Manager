import React, { useEffect, useState } from 'react';
import 'remixicon/fonts/remixicon.css';
import { fetchCategories, createCategory, fetchTransactions, createTransaction, deleteTransaction } from './services/api';
import Dashboard from './Dashboard';
import RecurringManager from './RecurringManager';

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

interface Transaction {
  _id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category; // populated
  date: string;
  description?: string;
}

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [newCatColor, setNewCatColor] = useState('#6B7280');
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });
  const [message, setMessage] = useState('');
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => setMessage('Ошибка соединения с сервером'));

    loadCategories();
    loadTransactions();
    loadForecast();
    
  }, []);

  const loadForecast = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/forecast?months=3&inflation=0.05');
    const data = await res.json();
    setForecast(data);
  } catch (error) {
    console.error('Failed to load forecast', error);
  }
};
  
  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions', error);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({ name: newCatName, type: newCatType, color: newCatColor });
      setNewCatName('');
      loadCategories();
    } catch (error) {
      console.error('Failed to create category', error);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.category) {
      alert('Выберите категорию');
      return;
    }
    try {
      await createTransaction({
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type,
        category: newTransaction.category,
        date: newTransaction.date,
        description: newTransaction.description,
      });
      setNewTransaction({
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().slice(0, 10),
        description: '',
      });
      loadTransactions();
      loadCategories(); // обновить категории (на случай, если изменился баланс категории)
    } catch (error) {
      console.error('Failed to create transaction', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Удалить транзакцию?')) {
      try {
        await deleteTransaction(id);
        loadTransactions();
      } catch (error) {
        console.error('Failed to delete transaction', error);
      }
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Personal Finance Manager</h1>
      <p>Server says: {message}</p>

      {/* Баланс */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', flex: 1 }}>
          <h3>Доходы</h3>
          <p style={{ fontSize: '24px', color: '#2e7d32' }}>+{totalIncome.toFixed(2)} ₽</p>
        </div>
        <div style={{ backgroundColor: '#ffebee', padding: '15px', borderRadius: '8px', flex: 1 }}>
          <h3>Расходы</h3>
          <p style={{ fontSize: '24px', color: '#c62828' }}>-{totalExpense.toFixed(2)} ₽</p>
        </div>
        <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', flex: 1 }}>
          <h3>Баланс</h3>
          <p style={{ fontSize: '24px', color: balance >= 0 ? '#2e7d32' : '#c62828' }}>
            {balance.toFixed(2)} ₽
          </p>
        </div>
      </div>
      <Dashboard transactions={transactions} />
      {forecast && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h2>Прогноз бюджета на следующий месяц</h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h3>Текущий месяц (среднее за 3 мес)</h3>
              <p>Доходы: {forecast.averageMonthly.income.toFixed(2)} ₽</p>
              <p>Расходы: {forecast.averageMonthly.expense.toFixed(2)} ₽</p>
              <p>Баланс: {(forecast.averageMonthly.income - forecast.averageMonthly.expense).toFixed(2)} ₽</p>
            </div>
            <div style={{ flex: 1 }}>
              <h3>Повторяющиеся операции в следующем месяце</h3>
              <p>Доходы: +{forecast.recurringNextMonth.income.toFixed(2)} ₽</p>
              <p>Расходы: -{forecast.recurringNextMonth.expense.toFixed(2)} ₽</p>
            </div>
            <div style={{ flex: 1 }}>
              <h3>Прогноз (с учётом инфляции +5%)</h3>
              <p>Доходы: {forecast.forecastNextMonth.income.toFixed(2)} ₽</p>
              <p>Расходы: {forecast.forecastNextMonth.expense.toFixed(2)} ₽</p>
              <p style={{ fontWeight: 'bold', color: (forecast.forecastNextMonth.income - forecast.forecastNextMonth.expense) >= 0 ? '#2e7d32' : '#c62828' }}>
                Ожидаемый баланс: {(forecast.forecastNextMonth.income - forecast.forecastNextMonth.expense).toFixed(2)} ₽
              </p>
            </div>
          </div>
        </div>
      )}
      <RecurringManager categories={categories} />
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Левая колонка: категории */}
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h2>Категории</h2>
          <form onSubmit={handleAddCategory} style={{ marginBottom: '20px' }}>
            <input
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="Название"
              required
              style={{ marginRight: '8px' }}
            />
            <select value={newCatType} onChange={e => setNewCatType(e.target.value as any)}>
              <option value="expense">Расход</option>
              <option value="income">Доход</option>
            </select>
            <input
              type="color"
              value={newCatColor}
              onChange={e => setNewCatColor(e.target.value)}
              style={{ marginLeft: '8px' }}
            />
            <button type="submit">Добавить</button>
          </form>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {categories.map(cat => (
              <li key={cat._id} style={{ marginBottom: '8px' }}>
                <i className={`ri-${cat.icon}`} style={{ marginRight: '8px' }}></i>
                {cat.name} ({cat.type === 'expense' ? 'расход' : 'доход'})
              </li>
            ))}
          </ul>
        </div>

        {/* Правая колонка: транзакции */}
        <div style={{ flex: 2, minWidth: '400px' }}>
          <h2>Добавить транзакцию</h2>
          <form onSubmit={handleAddTransaction} style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="number"
                value={newTransaction.amount}
                onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                placeholder="Сумма"
                required
                step="0.01"
              />
              <select
                value={newTransaction.type}
                onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
              >
                <option value="expense">Расход</option>
                <option value="income">Доход</option>
              </select>
              <select
                value={newTransaction.category}
                onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={newTransaction.date}
                onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                required
              />
              <input
                type="text"
                value={newTransaction.description}
                onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                placeholder="Описание (необязательно)"
              />
              <button type="submit">Добавить</button>
            </div>
          </form>

          <h2>Список транзакций</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Дата</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Категория</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Описание</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>Сумма</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{new Date(t.date).toLocaleDateString()}</td>
                  <td style={{ padding: '8px' }}>
                    <i className={`ri-${t.category.icon}`} style={{ marginRight: '4px' }}></i>
                    {t.category.name}
                  </td>
                  <td style={{ padding: '8px' }}>{t.description || '-'}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: t.type === 'income' ? '#2e7d32' : '#c62828' }}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} ₽
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <button onClick={() => handleDeleteTransaction(t._id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;