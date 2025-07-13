import mongoose, { Schema, Document } from 'mongoose';

const ShippingMethodSchema = new mongoose.Schema({
  name: { type: String, required: true }, // z.B. "Standard"
  key: { type: String, required: true, unique: true }, // z.B. "standard"
  price: { type: Number, required: true }, // z.B. 4.95
  description: String, // optional
  estimatedDays: Number // z.B. 2 für 2 Werktage
});

export const ShippingMethod = mongoose.model('ShippingMethod', ShippingMethodSchema);
