import Category from '../models/Category';

const defaultCategories = [
  { name: 'Продукты', type: 'expense', color: '#6B7280', icon: 'restaurant-line' },
  { name: 'Транспорт', type: 'expense', color: '#6B7280', icon: 'car-line' },
  { name: 'Развлечения', type: 'expense', color: '#6B7280', icon: 'gamepad-line' },
  { name: 'Зарплата', type: 'income', color: '#6B7280', icon: 'money-cny-box-line' },
  { name: 'Подработка', type: 'income', color: '#6B7280', icon: 'briefcase-line' },
];

export const seedCategories = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany(defaultCategories);
    console.log('Default categories added');
  } else {
    console.log('Categories already exist, skipping seed');
  }
};