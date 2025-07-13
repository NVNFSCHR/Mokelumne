import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId?: string;
  products: { productId: string; quantity: number }[];
  deliveryType: string
  contact: {
    email: string;
    phoneNumber: string;
  };
  shippingAddress: {
    title: 'Herr' | 'Frau' | 'Divers ' | 'Dr.' ;
    firstName: string;
    lastName: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  coupon: {
    code: string;
    discountPercent: number;
    discountAmount: number;
  };
  payment: {
    method: 'invoice' | 'credit_card' | 'paypal';
    status: 'pending' | 'paid' | 'failed';
    dueDate?: Date;
  };
  status: 'open' | 'paid' | 'shipped';
  createdAt: Date;
  totalAmount?: number; // Optional, falls benötigt
}


const OrderSchema = new Schema<IOrder>({
  userId: { type: String, required: false },
  products: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true }
  }],
  deliveryType: {
    type: String,
    required: true
  },
  contact: {
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true }
  },
  shippingAddress: {
    title: { type: String, enum: ['Herr', 'Frau', 'Divers', 'Dr.'], required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    postalCode: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  coupon: {
    code: { type: String, required: false },
    discountPercent: { type: Number, required: false },
    discountAmount: { type: Number, required: false },
  },
  payment: {
    method: { type: String, enum: ['invoice', 'credit_card', 'paypal'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    dueDate: Date
  },
  status: { type: String, enum: ['open', 'paid', 'shipped'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  totalAmount: { type: Number, required: false } // Optional, falls benötigt
});


export const Order = mongoose.model<IOrder>('Order', OrderSchema);
