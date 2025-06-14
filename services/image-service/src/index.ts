import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/mongo';
import imageRoutes from './routes/image.routes'; // falls vorhanden

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use('/api/images', imageRoutes); // optional

app.get('/', (req, res) => {
  res.send('Image Service is running');
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Image Service läuft auf Port ${port}`);
  });
});
