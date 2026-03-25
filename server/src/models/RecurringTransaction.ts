import mongoose, { Schema, Document } from 'mongoose';

export interface IRecurringTransaction extends Document {
  amount: number;
  type: 'income' | 'expense';
  category: mongoose.Types.ObjectId;
  description?: string;
  period: 'daily' | 'weekly' | 'monthly';
  nextRun: Date;
  active: boolean;
  user: mongoose.Types.ObjectId;
}

const RecurringSchema = new Schema<IRecurringTransaction>({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String },
  period: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  nextRun: { type: Date, required: true },
  active: { type: Boolean, default: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IRecurringTransaction>('RecurringTransaction', RecurringSchema);