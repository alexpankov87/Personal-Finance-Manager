import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import categoryRoutes from './routes/categoryRoutes';
import transactionRoutes from './routes/transactionRoutes';
import recurringRoutes from './routes/recurringRoutes';
import cron from 'node-cron';
import { processRecurringTransactions } from './cron/recurringJobs';
import forecastRoutes from './routes/forecastRoutes';
import exportRoutes from './routes/exportRoutes';
import bankRoutes from './routes/bankRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();
connectDB().then(() => {
  console.log('Connected to MongoDB');
});

const app = express();
const PORT = process.env.PORT || 5001;

// Настройка CORS: разрешаем localhost и URL из переменной окружения
const allowedOrigins = [
  'http://localhost:5173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
];

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Cron для повторяющихся операций (раз в 5 минут)
cron.schedule('*/5 * * * *', () => {
  console.log('Checking recurring transactions...');
  processRecurringTransactions().catch(console.error);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/bank', bankRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});