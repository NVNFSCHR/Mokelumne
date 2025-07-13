// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string
  firebaseUid: string;
  email: string;
  title?: 'Herr' | 'Frau' | 'Divers' | 'Dr.' | '';
  name?: string; // Optional combined name field
  first_name?: string;
  last_name?: string;
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
  title: { type: String, enum: ['Herr', 'Frau', 'Divers', 'Dr.', ''], default: '' },
  name: { type: String, default: '' }, // Optional combined name field
  first_name: { type: String },
  last_name: { type: String },
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
