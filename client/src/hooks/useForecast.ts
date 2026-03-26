import { useState, useCallback } from 'react';
import { fetchForecast } from '../services/api';
import type { ForecastData } from '../types';

interface UseForecastReturn {
  forecast: ForecastData | null;
  loading: boolean;
  error: string | null;
  loadForecast: (months?: number, inflation?: number, period?: string) => Promise<void>;
  setPeriod: (period: string) => void;
  period: string;
}

export const useForecast = (initialMonths = 3, initialInflation = 0.05, initialPeriod = 'month'): UseForecastReturn => {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(initialPeriod);

  const loadForecast = useCallback(async (months = initialMonths, inflation = initialInflation, p = period) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchForecast(months, inflation, p);
      setForecast(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load forecast';
      setError(message);
      console.error('Load forecast error:', err);
    } finally {
      setLoading(false);
    }
  }, [initialMonths, initialInflation, period]);

  const handleSetPeriod = useCallback((newPeriod: string) => {
    setPeriod(newPeriod);
    loadForecast(initialMonths, initialInflation, newPeriod);
  }, [initialMonths, initialInflation, loadForecast]);

  return {
    forecast,
    loading,
    error,
    loadForecast,
    setPeriod: handleSetPeriod,
    period,
  };
};