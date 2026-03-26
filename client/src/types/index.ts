export interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

export interface Transaction {
  _id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  date: string;
  description?: string;
}

export interface RecurringTransaction {
  _id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  description?: string;
  period: 'daily' | 'weekly' | 'monthly';
  nextRun: string;
  active: boolean;
}

export interface ForecastData {
  currentMonth: { income: number; expense: number };
  averageMonthly: { income: number; expense: number };
  recurringNextMonth: { income: number; expense: number };
  forecastNextMonth: { income: number; expense: number };
  monthlyData?: { month: string; income: number; expense: number }[];
}