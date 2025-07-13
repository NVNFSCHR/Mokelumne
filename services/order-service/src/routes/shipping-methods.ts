import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { ShippingMethod } from '../models/ShippingMethod';

const router = express.Router();

// Öffentlich - alle können Versandmethoden abrufen
router.get('/', async (req, res) => {
  const methods = await ShippingMethod.find();
  res.json(methods);
});

router.get('/:key', async (req, res) => {
  const method = await ShippingMethod.findOne({ key: req.params.key });
  if (!method) return res.status(404).json({ message: 'Versandmethode nicht gefunden' });
  res.json(method);
});

// Admin-only - Versandmethode erstellen
router.post('/', authenticate, async (req, res) => {
  const { role } = (req as any).user;

  if (role !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  const { name, key, price, description, estimatedDays } = req.body;

  if (!name || !key || typeof price !== 'number') {
    return res.status(400).json({ message: 'Ungültige Daten' });
  }

  const exists = await ShippingMethod.findOne({ key });
  if (exists) return res.status(409).json({ message: 'Key existiert bereits' });

  const method = new ShippingMethod({ name, key, price, description, estimatedDays });
  await method.save();

  res.status(201).json(method);
});

// Admin-only - Versandmethode aktualisieren
router.put('/:id', authenticate, async (req, res) => {
  const { role } = (req as any).user;

  if (role !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  const updated = await ShippingMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Nicht gefunden' });

  res.json(updated);
});

// Admin-only - Versandmethode löschen
router.delete('/:id', authenticate, async (req, res) => {
  const { role } = (req as any).user;

  if (role !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  await ShippingMethod.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

export default router;
