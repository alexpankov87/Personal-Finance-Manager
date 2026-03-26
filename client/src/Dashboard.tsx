import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { ru, enUS, kk } from 'date-fns/locale';

interface DashboardProps {
  transactions: any[];
  monthlyData?: any[];
  period?: string;
  onPeriodChange?: (period: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, monthlyData = [], period = 'month', onPeriodChange }) => {
  const { t, i18n } = useTranslation();
  
  const getLocale = () => {
    switch (i18n.language) {
      case 'ru': return ru;
      case 'kk': return kk;
      default: return enUS;
    }
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr);
    return format(date, 'LLL yyyy', { locale: getLocale() });
  };

  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any[], t) => {
      const catName = t.category.name;
      const existing = acc.find(item => item.name === catName);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: catName, value: t.amount });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);

  const lineData = monthlyData.map(item => ({
    month: formatMonth(item.month),
    income: item.income,
    expense: item.expense,
  }));

  const barData = monthlyData.map(item => ({
    month: formatMonth(item.month),
    income: item.income,
    expense: item.expense,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#00E396', '#FEB019'];

  const periodOptions = [
    { value: 'month', label: t('last3months') },
    { value: 'quarter', label: t('lastQuarter') },
    { value: 'year', label: t('lastYear') },
  ];

  return (
    <div style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{t('dashboard')}</h2>
        {onPeriodChange && (
          <select 
            value={period} 
            onChange={(e) => onPeriodChange(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
          >
            {periodOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3>{t('expenseByCategory')}</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value?.toFixed(2)} ₽`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>{t('noExpenseData')}</p>
          )}
        </div>

        <div style={{ flex: 2, minWidth: '400px' }}>
          <h3>{t('incomeExpenseDynamics')}</h3>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `${value?.toFixed(2)} ₽`} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#2e7d32" name={t('income')} />
                <Line type="monotone" dataKey="expense" stroke="#c62828" name={t('expense')} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>{t('noMonthlyData')}</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>{t('comparisonChart')}</h3>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => `${value?.toFixed(2)} ₽`} />
              <Legend />
              <Bar dataKey="income" fill="#2e7d32" name={t('income')} />
              <Bar dataKey="expense" fill="#c62828" name={t('expense')} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>{t('noMonthlyData')}</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;