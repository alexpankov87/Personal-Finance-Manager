import { useState, useEffect, useCallback } from 'react';
import { fetchCategories, createCategory, deleteCategory } from '../services/api';
import type { Category } from '../types';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  addCategory: (data: any) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export const useCategories = (initialLoad = true): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load categories';
      setError(message);
      console.error('Load categories error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = useCallback(async (data: any) => {
    try {
      setError(null);
      const newCategory = await createCategory(data);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      setError(message);
      throw err;
    }
  }, []);

  const handleDeleteCategory = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat._id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (initialLoad) {
      loadCategories();
    }
  }, [initialLoad, loadCategories]);

  return {
    categories,
    loading,
    error,
    addCategory,
    deleteCategory: handleDeleteCategory,
    reload: loadCategories,
  };
};