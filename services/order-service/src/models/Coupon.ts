import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountPercent: number;
  expiresAt?: Date;
  usageLimit?: number;
  usedCount: number;
  onlyOncePerUser: boolean;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true }, // z. B. 10 = 10%
  expiresAt: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  onlyOncePerUser: { type: Boolean, default: false }
});

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
