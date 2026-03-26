import { useState, useEffect, useCallback } from 'react';
import { fetchRecurring, createRecurring, updateRecurring, deleteRecurring } from '../services/api';
import type { RecurringTransaction } from '../types';

interface UseRecurringReturn {
  recurring: RecurringTransaction[];
  loading: boolean;
  error: string | null;
  addRecurring: (data: any) => Promise<RecurringTransaction>;
  updateRecurring: (id: string, data: any) => Promise<RecurringTransaction>;
  deleteRecurring: (id: string) => Promise<void>;
  toggleActive: (id: string, currentActive: boolean) => Promise<void>;
  reload: () => Promise<void>;
}

export const useRecurring = (initialLoad = true): UseRecurringReturn => {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecurring = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRecurring();
      setRecurring(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load recurring transactions';
      setError(message);
      console.error('Load recurring error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addRecurring = useCallback(async (data: any) => {
    try {
      setError(null);
      const newRecurring = await createRecurring(data);
      setRecurring(prev => [...prev, newRecurring]);
      return newRecurring;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create recurring transaction';
      setError(message);
      throw err;
    }
  }, []);

  const handleUpdateRecurring = useCallback(async (id: string, data: any) => {
    try {
      setError(null);
      const updated = await updateRecurring(id, data);
      setRecurring(prev => prev.map(r => r._id === id ? updated : r));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update recurring transaction';
      setError(message);
      throw err;
    }
  }, []);

  const handleDeleteRecurring = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteRecurring(id);
      setRecurring(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete recurring transaction';
      setError(message);
      throw err;
    }
  }, []);

  const toggleActive = useCallback(async (id: string, currentActive: boolean) => {
    try {
      setError(null);
      const updated = await updateRecurring(id, { active: !currentActive });
      setRecurring(prev => prev.map(r => r._id === id ? updated : r));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle recurring status';
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (initialLoad) {
      loadRecurring();
    }
  }, [initialLoad, loadRecurring]);

  return {
    recurring,
    loading,
    error,
    addRecurring,
    updateRecurring: handleUpdateRecurring,
    deleteRecurring: handleDeleteRecurring,
    toggleActive,
    reload: loadRecurring,
  };
};