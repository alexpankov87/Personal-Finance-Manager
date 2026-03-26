import { useState, useEffect, useCallback } from 'react';
import { fetchTransactions, createTransaction, deleteTransaction, updateTransaction } from '../services/api';
import type { Transaction } from '../types';

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (data: any) => Promise<Transaction>;
  updateTransaction: (id: string, data: any) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export const useTransactions = (initialLoad = true): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(message);
      console.error('Load transactions error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback(async (data: any) => {
    try {
      setError(null);
      const newTransaction = await createTransaction(data);
      setTransactions(prev => [...prev, newTransaction]);
      return newTransaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(message);
      throw err;
    }
  }, []);

  const handleUpdateTransaction = useCallback(async (id: string, data: any) => {
    try {
      setError(null);
      const updated = await updateTransaction(id, data);
      setTransactions(prev => prev.map(t => t._id === id ? updated : t));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update transaction';
      setError(message);
      throw err;
    }
  }, []);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (initialLoad) {
      loadTransactions();
    }
  }, [initialLoad, loadTransactions]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction: handleUpdateTransaction,
    deleteTransaction: handleDeleteTransaction,
    reload: loadTransactions,
  };
};