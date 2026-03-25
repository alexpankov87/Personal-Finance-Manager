import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  color: { type: String, default: '#000000' },
  icon: String,
}, { timestamps: true });

export default mongoose.model<ICategory>('Category', CategorySchema);