import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import categoryRoutes from './routes/categoryRoutes';
import recurringRoutes from './routes/recurringRoutes';
import transactionRoutes from './routes/transactionRoutes'; 
import { seedCategories } from './seeds/categories';
import cron from 'node-cron';
import { processRecurringTransactions } from './cron/recurringJobs';
import forecastRoutes from './routes/forecastRoutes';
import exportRoutes from './routes/exportRoutes';
import bankRoutes from './routes/bankRoutes';

dotenv.config();
connectDB().then(() => {
  seedCategories();
});

const app = express();
const PORT = process.env.PORT || 5000;

cron.schedule('*/5 * * * *', () => {
  console.log('Checking recurring transactions...');
  processRecurringTransactions().catch(console.error);
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes); 
app.use('/api/recurring', recurringRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/bank', bankRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});