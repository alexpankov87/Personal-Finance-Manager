import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DashboardProps {
  transactions: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  // Расходы по категориям
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

  // Динамика по месяцам (доходы и расходы)
  const monthlyData = transactions.reduce((acc: any[], t) => {
    const date = new Date(t.date);
    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      if (t.type === 'income') existing.income += t.amount;
      else existing.expense += t.amount;
    } else {
      acc.push({
        month,
        income: t.type === 'income' ? t.amount : 0,
        expense: t.type === 'expense' ? t.amount : 0,
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#00E396', '#FEB019'];

  return (
    <div style={{ marginTop: '30px' }}>
      <h2>Дашборд</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3>Расходы по категориям</h3>
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
            <p>Нет данных о расходах</p>
          )}
        </div>

        <div style={{ flex: 2, minWidth: '400px' }}>
          <h3>Динамика доходов и расходов</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `${value?.toFixed(2)} ₽`} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#2e7d32" name="Доходы" />
                <Line type="monotone" dataKey="expense" stroke="#c62828" name="Расходы" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>Нет данных за периоды</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;