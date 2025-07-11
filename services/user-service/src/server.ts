import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/user';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/user', userRoutes);

mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    app.listen(3000, () => console.log('User Service running on port 3000'));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
