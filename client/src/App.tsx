import React, { useEffect, useState } from 'react';
import { fetchCategories, createCategory } from './services/api';
import 'remixicon/fonts/remixicon.css';

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [newColor, setNewColor] = useState('#000000');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Проверка здоровья сервера
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => setMessage('Ошибка соединения с сервером'));

    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({ name: newName, type: newType, color: newColor });
      setNewName('');
      loadCategories();
    } catch (error) {
      console.error('Failed to create category', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Personal Finance Manager</h1>
      <p>Server says: {message}</p>

      <h2>Categories</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Category name"
          required
        />
        <select value={newType} onChange={e => setNewType(e.target.value as any)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          type="color"
          value={newColor}
          onChange={e => setNewColor(e.target.value)}
        />
        <button type="submit">Add Category</button>
      </form>

      <ul>
        {categories.map(cat => (
          <li key={cat._id} style={{ color: cat.color }}>
            <i className={`ri-${cat.icon}`} style={{ marginRight: '8px' }}></i>
            {cat.name} ({cat.type})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;