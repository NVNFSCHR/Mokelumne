// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  name?: string;
  role: 'customer' | 'admin';
  address?: {
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  phoneNumber?: string;
}

const UserSchema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  address: {
    street: String,
    postalCode: String,
    city: String,
    country: String,
  },
  phoneNumber: String,
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
