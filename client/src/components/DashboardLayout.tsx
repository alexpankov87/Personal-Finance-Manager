import React, { useState } from 'react';
import 'remixicon/fonts/remixicon.css';
import { useTranslation } from 'react-i18next';
import { fetchMockBankTransactions, importBankTransactions } from '../services/api';
import Dashboard from '../Dashboard';
import RecurringManager from '../RecurringManager';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';
import { useForecast } from '../hooks/useForecast';
import { useRecurring } from '../hooks/useRecurring';


const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function DashboardLayout() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const [isImporting, setIsImporting] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
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
  const [newCatIcon, setNewCatIcon] = useState('restaurant-line');

  const iconOptions = [
    { value: 'restaurant-line', labelKey: 'food' },
    { value: 'car-line', labelKey: 'transport' },
    { value: 'gamepad-line', labelKey: 'entertainment' },
    { value: 'money-cny-box-line', labelKey: 'salary' },
    { value: 'briefcase-line', labelKey: 'sideJob' },
    { value: 'shopping-bag-line', labelKey: 'shopping' },
    { value: 'heart-line', labelKey: 'health' },
    { value: 'home-line', labelKey: 'housing' },
    { value: 'plane-line', labelKey: 'travel' },
    { value: 'phone-line', labelKey: 'phone' },
    { value: 'book-line', labelKey: 'education' },
    { value: 'gift-line', labelKey: 'gift' },
  ];

  // Используем хуки для данных
  const { categories, addCategory, deleteCategory } = useCategories();
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const { forecast, period, setPeriod } = useForecast(3, 0.05, 'month');
  const { recurring, addRecurring, updateRecurring, deleteRecurring, toggleActive } = useRecurring();

  // Проверка здоровья сервера
  React.useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage(t('serverError')));
  }, [t]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCategory({ 
        name: newCatName, 
        type: newCatType, 
        color: newCatColor,
        icon: newCatIcon
      });
      toast.success(t('categoryAdded'));
      setNewCatName('');
      setNewCatIcon('restaurant-line');
    } catch (error) {
      console.error('Failed to create category', error);
      toast.error(t('categoryAddError'));
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.category) {
       toast.error(t('selectCategory'));
      return;
    }
    try {
      await addTransaction({
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type,
        category: newTransaction.category,
        date: newTransaction.date,
        description: newTransaction.description,
      });
      toast.success(t('transactionAdded'));
      setNewTransaction({
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().slice(0, 10),
        description: '',
      });
    } catch (error) {
      console.error('Failed to create transaction', error);
      toast.error(t('transactionAddError'));
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm(t('deleteConfirm'))) {
      try {
        await deleteTransaction(id);
        toast.success(t('transactionDeleted'));
      } catch (error) {
        console.error('Failed to delete transaction', error);
        toast.error(t('deleteError'));
      }
    }
  };

  const exportToCSV = () => {
    const data = transactions.map(tx => ({
      [t('date')]: new Date(tx.date).toLocaleDateString(),
      [t('category')]: tx.category.name,
      [t('description')]: tx.description || '',
      [t('amount')]: `${tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)} ₽`,
    }));
    const csv = Papa.unparse(data, { delimiter: ';' });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importFromBank = async () => {
    if (isImporting) return;

    setIsImporting(true);
    try {
      const mockTransactions = await fetchMockBankTransactions();
      const result = await importBankTransactions(mockTransactions);
      toast.success(`Импортировано ${result.transactions.length} транзакций`);
    } catch (error) {
      console.error('Import failed', error);
      toast.error('Ошибка импорта');
    } finally {
      setIsImporting(false);
    }
  };

  const exportToPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transactions }),
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export PDF', error);
      alert('Ошибка при экспорте PDF');
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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '10px' }}>
        <button onClick={() => changeLanguage('ru')}>🇷🇺 Русский</button>
        <button onClick={() => changeLanguage('en')}>🇬🇧 English</button>
        <button onClick={() => changeLanguage('kk')}>🇰🇿 Қазақша</button>
        <button onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button onClick={() => setShowThemePanel(!showThemePanel)}>
          🎨 {t('theme')}
        </button>
        <button onClick={logout}>{t('logout')}</button>
      </div>
      <h1>{t('title')}</h1>
      <p>{t('serverStatus')} {message}</p>

      <div className="balance-container">
        <div className="card">
          <h3>{t('income')}</h3>
          <p className="income-text">+{totalIncome.toFixed(2)} ₽</p>
        </div>
        <div className="card">
          <h3>{t('expense')}</h3>
          <p className="expense-text">-{totalExpense.toFixed(2)} ₽</p>
        </div>
        <div className="card">
          <h3>{t('balance')}</h3>
          <p className={balance >= 0 ? 'balance-positive' : 'balance-negative'}>
            {balance.toFixed(2)} ₽
          </p>
        </div>
      </div>

      <Dashboard
        transactions={transactions}
        monthlyData={forecast?.monthlyData || []}
        period={period}
        onPeriodChange={setPeriod}
      />

      {forecast && (
        <div className="card forecast-card">
          <h2>{t('forecastTitle')}</h2>
          <div className="forecast-stats">
            <div className="forecast-stat">
              <h3>{t('currentMonthAvg')}</h3>
              <p>{t('income')}: {forecast.averageMonthly.income.toFixed(2)} ₽</p>
              <p>{t('expense')}: {forecast.averageMonthly.expense.toFixed(2)} ₽</p>
              <p>{t('balance')}: {(forecast.averageMonthly.income - forecast.averageMonthly.expense).toFixed(2)} ₽</p>
            </div>
            <div className="forecast-stat">
              <h3>{t('recurringNextMonth')}</h3>
              <p>{t('income')}: +{forecast.recurringNextMonth.income.toFixed(2)} ₽</p>
              <p>{t('expense')}: -{forecast.recurringNextMonth.expense.toFixed(2)} ₽</p>
            </div>
            <div className="forecast-stat">
              <h3>{t('forecastWithInflation')}</h3>
              <p>{t('income')}: {forecast.forecastNextMonth.income.toFixed(2)} ₽</p>
              <p>{t('expense')}: {forecast.forecastNextMonth.expense.toFixed(2)} ₽</p>
              <p className={(forecast.forecastNextMonth.income - forecast.forecastNextMonth.expense) >= 0 ? 'balance-positive' : 'balance-negative'}>
                {t('expectedBalance')}: {(forecast.forecastNextMonth.income - forecast.forecastNextMonth.expense).toFixed(2)} ₽
              </p>
            </div>
          </div>
        </div>
      )}

      <RecurringManager 
        categories={categories}
        recurring={recurring}
        onAdd={addRecurring}
        onUpdate={updateRecurring}
        onDelete={deleteRecurring}
        onToggleActive={toggleActive}
      />

      <div className="content-container">
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h2>{t('categories')}</h2>
          <form onSubmit={handleAddCategory} className="form-group">
            <input
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder={t('categoryName')}
              required
            />
            <select value={newCatType} onChange={e => setNewCatType(e.target.value as any)}>
              <option value="expense">{t('expenseType')}</option>
              <option value="income">{t('incomeType')}</option>
            </select>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select 
                value={newCatIcon} 
                onChange={e => setNewCatIcon(e.target.value)}
                style={{ flex: 1 }}
              >
                {iconOptions.map(icon => (
                  <option key={icon.value} value={icon.value}>
                    {t(icon.labelKey)}
                  </option>
                ))}
              </select>
              <i className={`ri-${newCatIcon}`} style={{ fontSize: '24px' }}></i>
            </div>
            
            <input
              type="color"
              value={newCatColor}
              onChange={e => setNewCatColor(e.target.value)}
            />
            <button type="submit">{t('addCategory')}</button>
          </form>
          <ul className="category-list">
           {categories.map(cat => (
              <li key={cat._id} className="category-item">
                <i className={`ri-${cat.icon}`} style={{ marginRight: '8px', fontSize: '24px' }}></i>
                {cat.name} ({cat.type === 'expense' ? t('expenseType') : t('incomeType')})
                <button 
                  onClick={async () => {
                    if (window.confirm(t('deleteCategoryConfirm'))) {
                      try {
                        await deleteCategory(cat._id);
                        toast.success(t('categoryDeleted'));
                      } catch (error) {
                        toast.error(t('deleteCategoryError'));
                      }
                    }
                  }}
                  className="icon-button"
                  style={{ marginLeft: '8px', color: 'var(--expense-color)' }}
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 2, minWidth: '400px' }}>
          <h2>{t('addTransaction')}</h2>
          <form onSubmit={handleAddTransaction} className="form-group">
            <input
              type="number"
              value={newTransaction.amount}
              onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              placeholder={t('amount')}
              required
              step="0.01"
            />
            <select
              value={newTransaction.type}
              onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
            >
              <option value="expense">{t('expenseType')}</option>
              <option value="income">{t('incomeType')}</option>
            </select>
            <select
              value={newTransaction.category}
              onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
              required
            >
              <option value="">{t('selectCategory')}</option>
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
              placeholder={t('description')}
            />
            <button type="submit">{t('addTransaction')}</button>
          </form>

          <h2>{t('transactionList')}</h2>
          <div className="export-buttons">
            <button 
                onClick={importFromBank} 
                disabled={isImporting}
                style={{ opacity: isImporting ? 0.6 : 1 }}
              >
                {isImporting ? t('importing') : t('importFromBank')}
              </button>
            <button onClick={exportToCSV}>{t('exportCSV')}</button>
            <button onClick={exportToPDF}>{t('exportPDF')}</button>
          </div>

          <div className="transactions-table">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>{t('date')}</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>{t('category')}</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>{t('description')}</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>{t('amount')}</th>
                  <th style={{ width: '50px' }}></th>
                 </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id}>
                    <td style={{ padding: '8px' }}>{new Date(tx.date).toLocaleDateString()}</td>
                    <td style={{ padding: '8px' }}>
                      {tx.category ? (
                        <>
                          <i className={`ri-${tx.category.icon}`} style={{ marginRight: '4px' }}></i>
                          {tx.category.name}
                        </>
                      ) : (
                        <span style={{ color: 'red' }}>{t('categoryDeleted')}</span>
                      )}
                    </td>
                    <td style={{ padding: '8px' }}>{tx.description || '-'}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: tx.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)' }}>
                      {tx.type === 'income' ? '+' : '-'}{tx.amount.toFixed(2)} ₽
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button onClick={() => handleDeleteTransaction(tx._id)} className="icon-button">
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

      {/* Модальное окно для темы */}
      {showThemePanel && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setShowThemePanel(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'var(--bg-primary)',
              border: `1px solid var(--border-color)`,
              borderRadius: '12px',
              padding: '24px',
              zIndex: 1000,
              minWidth: '300px',
              maxWidth: '90vw',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{t('themeSettings')}</h3>
              <button
                onClick={() => setShowThemePanel(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '4px 8px',
                }}
              >
                ✖️
              </button>
            </div>
            <ThemeSwitcher />
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardLayout;