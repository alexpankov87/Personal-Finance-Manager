import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import categoryRoutes from './routes/categoryRoutes';
import transactionRoutes from './routes/transactionRoutes'; // <-- добавить
import { seedCategories } from './seeds/categories';

dotenv.config();
connectDB().then(() => {
  seedCategories();
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes); // <-- добавить

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});