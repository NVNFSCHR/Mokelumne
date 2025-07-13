import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { Cart } from '../models/Cart';

const router = express.Router();

// GET /api/cart
router.get('/', authenticate, async (req, res) => {
  const { uid } = (req as any).user;
  const cart = await Cart.findOne({ userId: uid });
  res.json(cart || { items: [] });
});

// PUT /api/cart (ersetzen oder neu erstellen)
router.put('/', authenticate, async (req, res) => {
  const { uid } = (req as any).user;
  const { items } = req.body;

  const updated = await Cart.findOneAndUpdate(
    { userId: uid },
    { items, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  res.json(updated);
});

// DELETE /api/cart (kompletten Warenkorb leeren)
router.delete('/', authenticate, async (req, res) => {
  const { uid } = (req as any).user;

  const cart = await Cart.findOne({ userId: uid });
  if (!cart) {
    return res.json({ items: [] }); // Bereits leer
  }

  cart.items = [];
  cart.updatedAt = new Date();
  await cart.save();

  res.json(cart);
});

// DELETE /api/cart/:productId
router.delete('/:productId', authenticate, async (req, res) => {
  const { uid } = (req as any).user;
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId: uid });
  if (!cart) return res.status(404).send('Kein Warenkorb gefunden');

  cart.items = cart.items.filter(i => i.productId !== productId);
  await cart.save();

  res.json(cart);
});

export default router;
