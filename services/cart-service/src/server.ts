import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cartRoutes from './routes/cart';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/cart', cartRoutes);

mongoose.connect(process.env.MONGO_URI!)
  .then(() => app.listen(3000, () => console.log('Cart Service läuft auf Port 3000')))
  .catch(err => console.error('DB Verbindung fehlgeschlagen', err));
