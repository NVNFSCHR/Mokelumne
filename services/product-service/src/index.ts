import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db/mongo';
import productRoutes from './routes/product.routes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/products', productRoutes);

(async () => {
  await connectDB(); // ⬅ Verbindung aufbauen
  app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
  });
})();
