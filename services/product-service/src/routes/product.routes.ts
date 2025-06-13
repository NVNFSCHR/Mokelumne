import { Router, Request, Response } from 'express';
import { Product } from '../models/product.model';
import { getDB } from '../db/mongo';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const products = await getDB().collection<Product>('products').find().toArray();
  res.json(products);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const product = await getDB()
      .collection<Product>('products')
      .findOne({ id: id }); // Suche nach "id"-Feld

    if (!product) {
      res.status(404).send('Produkt nicht gefunden');
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Fehler beim Abrufen des Produkts', error);
    res.status(500).send('Interner Serverfehler');
  }
});

router.post('/', async (req: Request, res: Response) => {
  const product = req.body;
  await getDB().collection('products').insertOne(product);
  res.status(201).json(product);
});

export default router;
