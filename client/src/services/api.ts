const API_BASE = 'http://localhost:5000/api';

export const fetchCategories = async () => {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

export const createCategory = async (data: { name: string; type: 'income' | 'expense'; color: string; icon?: string }) => {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
};

// ===== НОВЫЕ ФУНКЦИИ ДЛЯ ТРАНЗАКЦИЙ =====
export const fetchTransactions = async () => {
  const res = await fetch(`${API_BASE}/transactions`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
};

export const createTransaction = async (data: {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description?: string;
}) => {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create transaction');
  return res.json();
};

export const deleteTransaction = async (id: string) => {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete transaction');
  return res.json();
};