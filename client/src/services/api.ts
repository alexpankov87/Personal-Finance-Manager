const API_BASE = 'http://localhost:5001/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchCategories = async () => {
  const res = await fetch(`${API_BASE}/categories`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

export const createCategory = async (data: { name: string; type: 'income' | 'expense'; color: string; icon?: string }) => {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
};

export const fetchTransactions = async () => {
  const res = await fetch(`${API_BASE}/transactions`, {
    headers: getAuthHeaders(),
  });
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
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create transaction');
  return res.json();
};

export const deleteTransaction = async (id: string) => {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete transaction');
  return res.json();
};

export const fetchRecurring = async () => {
  const res = await fetch(`${API_BASE}/recurring`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch recurring');
  return res.json();
};

export const createRecurring = async (data: any) => {
  const res = await fetch(`${API_BASE}/recurring`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create recurring');
  return res.json();
};

export const updateRecurring = async (id: string, data: any) => {
  const res = await fetch(`${API_BASE}/recurring/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update recurring');
  return res.json();
};

export const deleteRecurring = async (id: string) => {
  const res = await fetch(`${API_BASE}/recurring/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete recurring');
  return res.json();
};

export const fetchMockBankTransactions = async () => {
  const res = await fetch(`${API_BASE}/bank/mock`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch mock bank transactions');
  return res.json();
};

export const importBankTransactions = async (transactions: any[]) => {
  const res = await fetch(`${API_BASE}/bank/import`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions }),
  });
  if (!res.ok) throw new Error('Failed to import bank transactions');
  return res.json();
};

export const fetchForecast = async (months = 3, inflation = 0.05, period = 'month') => {
  const res = await fetch(`${API_BASE}/forecast?months=${months}&inflation=${inflation}&period=${period}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch forecast');
  return res.json();
};