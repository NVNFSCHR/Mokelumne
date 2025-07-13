import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import orderRoutes from './routes/order';
import couponRoutes from './routes/coupon';
import shippingRoutes from './routes/shipping-methods';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/shipping-methods', shippingRoutes);

mongoose.connect(process.env.MONGO_URI!)
  .then(() => app.listen(3000, () => console.log('Order Service läuft auf Port 3000')))
  .catch(err => console.error('MongoDB-Verbindung fehlgeschlagen', err));
