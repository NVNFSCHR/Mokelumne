// routes/coupon.ts
import express from 'express';
import { Coupon } from '../models/Coupon';
import { authenticate } from '../middleware/authenticate'; // Admin Middleware importieren

const router = express.Router();

// Validierungs-Endpunkt
router.get('/validate/:code', async (req, res) => {
  const code = req.params.code;

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
});

// Admin Middleware hier einbauen
router.post('/', authenticate, async (req, res) => {
  const { role } = (req as any).user;

  if (role !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  const { code, discountPercent, expiresAt, usageLimit, onlyOncePerUser } = req.body;

  if (!code || !discountPercent) {
    return res.status(400).json({ message: 'Code und Rabatt erforderlich' });
  }

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
});

export default router;
