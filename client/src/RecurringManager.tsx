import React, { useState, useEffect } from 'react';
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
      alert('Выберите категорию');
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
    if (window.confirm('Удалить шаблон?')) {
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
    <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
      <h2>Повторяющиеся операции</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="number"
            placeholder="Сумма"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            required
            step="0.01"
          />
          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value as any })}
          >
            <option value="expense">Расход</option>
            <option value="income">Доход</option>
          </select>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            required
          >
            <option value="">Выберите категорию</option>
            {categories.filter(c => c.type === form.type).map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Описание"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <select
            value={form.period}
            onChange={e => setForm({ ...form, period: e.target.value as any })}
          >
            <option value="daily">Ежедневно</option>
            <option value="weekly">Еженедельно</option>
            <option value="monthly">Ежемесячно</option>
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
            Активна
          </label>
          <button type="submit">{editingId ? 'Обновить' : 'Добавить'}</button>
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
            }}>Отмена</button>
          )}
        </div>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Сумма</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Категория</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Описание</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Период</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Следующий запуск</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Статус</th>
            <th style={{ width: '100px' }}></th>
           </tr>
        </thead>
        <tbody>
          {recurringList.map(item => (
            <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px', color: item.type === 'income' ? '#2e7d32' : '#c62828' }}>
                {item.type === 'income' ? '+' : '-'}{item.amount.toFixed(2)} ₽
              </td>
              <td style={{ padding: '8px' }}>{item.category.name}</td>
              <td style={{ padding: '8px' }}>{item.description || '-'}</td>
              <td style={{ padding: '8px' }}>
                {item.period === 'daily' && 'Ежедневно'}
                {item.period === 'weekly' && 'Еженедельно'}
                {item.period === 'monthly' && 'Ежемесячно'}
              </td>
              <td style={{ padding: '8px' }}>{new Date(item.nextRun).toLocaleDateString()}</td>
              <td style={{ padding: '8px' }}>
                <button onClick={() => toggleActive(item)}>
                  {item.active ? 'Активна' : 'Неактивна'}
                </button>
              </td>
              <td style={{ padding: '8px' }}>
                    <button onClick={() => handleEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <i className="ri-edit-line"></i>
                    </button>
                    <button onClick={() => handleDelete(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <i className="ri-delete-bin-line"></i>
                    </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecurringManager;