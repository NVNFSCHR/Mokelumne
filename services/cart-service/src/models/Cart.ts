import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
  userId: string;
  items: { productId: string; quantity: number }[];
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>({
  userId: { type: String, required: true, unique: true },
  items: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true }
  }],
  updatedAt: { type: Date, default: Date.now }
});

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
