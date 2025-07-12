import { Router, Request, Response } from 'express';
import { Product } from '../models/product.model';
import { getDB } from '../db/mongo';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const products = await getDB().collection<Product>('products').find().toArray();
  res.json(products);
});

router.get('/homeview', async (req: Request, res: Response) => {
  try {
    const homeviewProducts = await getDB()
      .collection<Product>('products')
      .find({ display_rank: { $gt: 0, $lte: 6 } })
      .sort({ display_rank: 1 })
      .toArray();

    if (homeviewProducts.length === 0) {
      res.json([]);
      return;
    }

    // Finde den höchsten Rang um die Array-Größe zu bestimmen
    const maxRank = Math.max(...homeviewProducts.map(p => p.display_rank));
    const sortedProducts: (Product | null)[] = new Array(maxRank).fill(null);

    homeviewProducts.forEach(product => {
      if (product.display_rank >= 1 && product.display_rank <= maxRank) {
        sortedProducts[product.display_rank - 1] = product;
      }
    });

    res.json(sortedProducts);
  } catch (error) {
    console.error('Fehler beim Abrufen der Startseiten-Produkte', error);
    res.status(500).json({ error: 'Interner Serverfehler' }); // JSON statt send()
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const product = await getDB()
      .collection<Product>('products')
      .findOne({ id: id });

    if (!product) {
     res.status(404).json({ error: 'Produkt nicht gefunden' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Fehler beim Abrufen des Produkts', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const product = req.body;
  await getDB().collection('products').insertOne(product);
  res.status(201).json(product);
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const updatedProduct = req.body;

  if (updatedProduct._id) {
    delete updatedProduct._id;
  }

  try {
    const result = await getDB()
      .collection<Product>('products')
      .updateOne(
        { id: id },
        { $set: updatedProduct }
      );

    if (result.matchedCount === 0) {
      res.status(404).json({ error: 'Produkt nicht gefunden' });
      return;
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Produkts', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const result = await getDB()
      .collection<Product>('products')
      .deleteOne({ id: id });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Produkt nicht gefunden' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Fehler beim Löschen des Produkts', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

export default router;
