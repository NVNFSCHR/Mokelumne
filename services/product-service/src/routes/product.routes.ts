import { Router, Request, Response, NextFunction } from 'express';
import { Product } from '../models/product.model';
import { getDB } from '../db/mongo';
import { authenticate } from '../middleware/authenticate';

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

router.post('/', authenticate, async (req, res) => {
  const { role } = (req as any).user;
  if (role !== 'admin') {
    res.status(403).json({ message: 'Zugriff verweigert' });
    return;
  }

  const product = req.body;
  await getDB().collection('products').insertOne(product);
  res.status(201).json(product);
});

router.put('/:id', authenticate, async (req, res) => {
  const { role } = (req as any).user;
  if (role !== 'admin') {
    res.status(403).json({ message: 'Zugriff verweigert' });
    return;
  }

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

router.delete('/:id', authenticate, async (req, res) => {
  const { role } = (req as any).user;
  if (role !== 'admin') {
    res.status(403).json({ message: 'Zugriff verweigert' });
    return;
  }

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

router.patch('/:id/stock', async (req, res) => {
  const secret = req.headers['x-internal-secret'];
  if (secret !== process.env.INTERNAL_SECRET) {
    res.status(403).json({ message: 'Zugriff verweigert' });
  }

  const id = parseInt(req.params.id);
  const { quantity } = req.body;

  if (typeof quantity !== 'number' || quantity <= 0) {
    res.status(400).json({ message: 'Ungültige Mengenangabe' });
  }

  try {
    const result = await getDB()
      .collection<Product>('products')
      .updateOne(
        { id: id, stock: { $gte: quantity } }, // Nur aktualisieren, wenn Bestand ausreicht
        { $inc: { stock: -quantity } }         // Bestand atomar verringern
      );

    if (result.matchedCount === 0) {
      const product = await getDB().collection<Product>('products').findOne({ id: id });
      if (!product) {
        res.status(404).json({ error: 'Produkt nicht gefunden' });
      } else {
        res.status(409).json({ error: 'Nicht genügend Lagerbestand' });
      }
    }

    res.status(200).json({ message: 'Lagerbestand erfolgreich aktualisiert' });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Lagerbestands:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});


export default router;
