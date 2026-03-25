import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  amount: number;
  type: 'income' | 'expense';
  category: mongoose.Types.ObjectId;
  date: Date;
  description?: string;
  user?: mongoose.Types.ObjectId; // пока не используем
}

const TransactionSchema = new Schema<ITransaction>({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);