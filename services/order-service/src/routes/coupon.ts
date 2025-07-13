// services/order-service/src/routes/coupon.ts
import express from 'express';
import { Coupon } from '../models/Coupon';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

// Alle Coupons abrufen (Admin-only)
router.get('/', authenticate, async (req, res) => {
  const { role } = (req as any).user;
  if (role !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).send('Serverfehler beim Abrufen der Coupons');
  }
});

// Coupon validieren (öffentlich)
router.get('/validate/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const coupon = await Coupon.findOne({ code });

    if (!coupon) return res.status(404).json({ valid: false, reason: 'not_found' });

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ valid: false, reason: 'expired' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ valid: false, reason: 'limit_reached' });
    }

    return res.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent
    });
  } catch (error) {
    res.status(500).send('Serverfehler bei der Coupon-Validierung');
  }
});

// Coupon erstellen (Admin-only)
router.post('/', authenticate, async (req, res) => {
  const { role } = (req as any).user;
  if (role !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  const { code, discountPercent, expiresAt, usageLimit, onlyOncePerUser } = req.body;

  if (!code || !discountPercent) {
    return res.status(400).json({ message: 'Code und Rabatt erforderlich' });
  }

  try {
    const existing = await Coupon.findOne({ code });
    if (existing) return res.status(409).json({ message: 'Code existiert bereits' });

    const coupon = new Coupon({
      code,
      discountPercent,
      expiresAt,
      usageLimit,
      onlyOncePerUser
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).send('Serverfehler beim Erstellen des Coupons');
  }
});

// Coupon löschen (Admin-only)
router.delete('/:id', authenticate, async (req, res) => {
  const { role } = (req as any).user;
  if (role !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).send('Coupon nicht gefunden');
    }
    res.status(200).json({ message: 'Coupon erfolgreich gelöscht' });
  } catch (error) {
    res.status(500).send('Serverfehler beim Löschen des Coupons');
  }
});

export default router;
