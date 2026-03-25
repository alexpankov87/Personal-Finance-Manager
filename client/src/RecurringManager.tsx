import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchRecurring, createRecurring, updateRecurring, deleteRecurring } from './services/api';

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
}

interface Recurring {
  _id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  description?: string;
  period: 'daily' | 'weekly' | 'monthly';
  nextRun: string;
  active: boolean;
}

const RecurringManager: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const { t } = useTranslation();
  const [recurringList, setRecurringList] = useState<Recurring[]>([]);
  const [form, setForm] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    period: 'monthly' as 'daily' | 'weekly' | 'monthly',
    nextRun: new Date().toISOString().slice(0, 10),
    active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadRecurring();
  }, []);

  const loadRecurring = async () => {
    try {
      const data = await fetchRecurring();
      setRecurringList(data);
    } catch (error) {
      console.error('Failed to load recurring', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) {
      alert(t('selectCategory'));
      return;
    }
    const data = {
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      description: form.description,
      period: form.period,
      nextRun: form.nextRun,
      active: form.active,
    };
    try {
      if (editingId) {
        await updateRecurring(editingId, data);
      } else {
        await createRecurring(data);
      }
      setForm({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        period: 'monthly',
        nextRun: new Date().toISOString().slice(0, 10),
        active: true,
      });
      setEditingId(null);
      loadRecurring();
    } catch (error) {
      console.error('Failed to save recurring', error);
    }
  };

  const handleEdit = (item: Recurring) => {
    setEditingId(item._id);
    setForm({
      amount: item.amount.toString(),
      type: item.type,
      category: item.category._id,
      description: item.description || '',
      period: item.period,
      nextRun: new Date(item.nextRun).toISOString().slice(0, 10),
      active: item.active,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('deleteConfirmRecurring'))) {
      try {
        await deleteRecurring(id);
        loadRecurring();
      } catch (error) {
        console.error('Failed to delete recurring', error);
      }
    }
  };

  const toggleActive = async (item: Recurring) => {
    try {
      await updateRecurring(item._id, { ...item, active: !item.active });
      loadRecurring();
    } catch (error) {
      console.error('Failed to toggle active', error);
    }
  };

  return (
    <div className="recurring-manager">
      <h2>{t('recurringOperations')}</h2>

      <form onSubmit={handleSubmit} className="form-group">
        <input
          type="number"
          placeholder={t('amount')}
          value={form.amount}
          onChange={e => setForm({ ...form, amount: e.target.value })}
          required
          step="0.01"
        />
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}>
          <option value="expense">{t('expenseType')}</option>
          <option value="income">{t('incomeType')}</option>
        </select>
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
          <option value="">{t('selectCategory')}</option>
          {categories.filter(c => c.type === form.type).map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder={t('description')}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value as any })}>
          <option value="daily">{t('daily')}</option>
          <option value="weekly">{t('weekly')}</option>
          <option value="monthly">{t('monthly')}</option>
        </select>
        <input
          type="date"
          value={form.nextRun}
          onChange={e => setForm({ ...form, nextRun: e.target.value })}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={form.active}
            onChange={e => setForm({ ...form, active: e.target.checked })}
          />
          {t('active')}
        </label>
        <button type="submit">{editingId ? t('save') : t('add')}</button>
        {editingId && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setForm({
              amount: '',
              type: 'expense',
              category: '',
              description: '',
              period: 'monthly',
              nextRun: new Date().toISOString().slice(0, 10),
              active: true,
            });
          }}>{t('cancel')}</button>
        )}
      </form>

      <div className="recurring-table">
        <table>
          <thead>
            <tr>
              <th>{t('amount')}</th>
              <th>{t('category')}</th>
              <th>{t('description')}</th>
              <th>{t('period')}</th>
              <th>{t('nextRun')}</th>
              <th>{t('status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recurringList.map(item => (
              <tr key={item._id}>
                <td className={item.type === 'income' ? 'income-text' : 'expense-text'}>
                  {item.type === 'income' ? '+' : '-'}{item.amount.toFixed(2)} ₽
                </td>
                <td>{item.category.name}</td>
                <td>{item.description || '-'}</td>
                <td>
                  {item.period === 'daily' && t('daily')}
                  {item.period === 'weekly' && t('weekly')}
                  {item.period === 'monthly' && t('monthly')}
                </td>
                <td>{new Date(item.nextRun).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => toggleActive(item)}>
                    {item.active ? t('active') : t('inactive')}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleEdit(item)} className="icon-button">
                    <i className="ri-edit-line"></i>
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="icon-button">
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecurringManager;