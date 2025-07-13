import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { Order } from '../models/Order';
import { Coupon } from '../models/Coupon';
import mongoose from 'mongoose';
import axios from 'axios';
const router = express.Router();

// Bestellung erstellen
router.post('/', async (req, res) => {
  const {
    userId,
    products,
    deliveryType,
    shippingAddress,
    contact,
    payment,
    couponCode
  } = req.body;

  async function calculateTotal(products: { productId: string; quantity: number }[]): Promise<number> {
    let total = 0;

    for (const item of products) {
      try {
        const response = await fetch(`http://product-service.mokelumne.svc.cluster.local:3000/api/products/${item.productId}`);

        if (!response.ok) {
          throw new Error(`Produkt ${item.productId} nicht gefunden`);
        }

        const product = await response.json() as { price: number };
        total += product.price * item.quantity;
      } catch (error) {
        console.error(`Fehler beim Abrufen des Produkts ${item.productId}:`, error);
        throw new Error(`Produktpreis für ${item.productId} konnte nicht abgerufen werden`);
      }
    }

    return total;
  }

  const totalWithoutDiscount = await calculateTotal(products);

  let discountAmount = 0;
  let couponInfo = undefined;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) return res.status(400).json({ message: 'Ungültiger Gutscheincode' });
    if (coupon.expiresAt && new Date() > coupon.expiresAt)
      return res.status(400).json({ message: 'Gutschein abgelaufen' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ message: 'Gutschein-Limit erreicht' });

    discountAmount = totalWithoutDiscount * (coupon.discountPercent / 100);
    couponInfo = {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount
    };

    coupon.usedCount += 1;
    await coupon.save();
  }

  async function getShippingPrice(deliveryType: string): Promise<number> {
    try {
      const response = await axios.get(`http://order-service.mokelumne.svc.cluster.local:3000/api/shipping-methods/${deliveryType}`);
      if (response.status !== 200) {
        throw new Error('Versandmethode nicht gefunden');
      }
      return response.data.price;
    } catch (error) {
      console.error('Fehler beim Abrufen der Versandkosten:', error);
      throw new Error('Versandkosten konnten nicht abgerufen werden');
    }
  }


  const finalAmount = totalWithoutDiscount - discountAmount + await getShippingPrice(deliveryType);


  const newOrder = new Order({
    userId: userId,
    products,
    deliveryType,
    shippingAddress,
    contact,
    payment: {
      method: payment.method,
      status: payment.method === 'invoice' ? 'pending' : 'paid',
      dueDate: payment.method === 'invoice' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : undefined
    },
    status: 'open',
    coupon: couponInfo,
    totalAmount: finalAmount
  });

  await newOrder.save();

  res.status(201).json(newOrder);
});

// Eigene Bestellungen anzeigen
router.get('/me', authenticate, async (req, res) => {
  console.log(req)
  const { uid } = (req as any).user;
  const orders = await Order.find({ userId: uid });
  res.json(orders);
});

// Alle Bestellungen (Admin-only)
router.get('/', authenticate, async (req, res) => {
  const { role } = (req as any).user;
  if (role !== 'admin') return res.status(403).send('Forbidden');

  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// Bestellungen suchen (Admin-only)
router.get('/search', authenticate, async (req, res) => {
  try {
    const { search, dateFrom, dateTo, status } = req.query;
    const query: any = {};

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { 'contact.email': searchRegex },
        { 'shippingAddress.lastName': searchRegex }
      ];
      if (mongoose.Types.ObjectId.isValid(search)) {
        query.$or.push({ _id: new mongoose.Types.ObjectId(search) });
      }
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom && typeof dateFrom === 'string') {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo && typeof dateTo === 'string') {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    if (status && typeof status === 'string') {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Fehler bei der Bestellsuche:', error);
    res.status(500).send('Serverfehler bei der Bestellsuche');
  }
});

// Bestellstatus aktualisieren (Admin-only)
router.patch('/:id/status', authenticate, async (req, res) => {
  const { role } = (req as any).user;
  if (role !== 'admin') return res.status(403).send('Forbidden');

  const { status } = req.body;
  if (!['open', 'paid', 'shipped'].includes(status)) {
    return res.status(400).send('Ungültiger Status');
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!order) return res.status(404).send('Bestellung nicht gefunden');
  res.json(order);
});

// Zahlungsstatus aktualisieren (Webhook/Admin)
router.patch('/:id/payment', authenticate, async (req, res) => {
  const { role } = (req as any).user;
  const secret = req.headers['x-webhook-secret'];

  // Erlaube Zugriff für Admins oder über einen sicheren Webhook
  if (role !== 'admin' && secret !== process.env.WEBHOOK_SECRET) {
    return res.status(403).send('Forbidden: Invalid credentials or webhook secret');
  }

  const { status } = req.body;
  if (!['pending', 'paid', 'failed'].includes(status)) {
    return res.status(400).send('Ungültiger Zahlungsstatus');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).send('Nicht gefunden');
  }

  order.payment.status = status;
  await order.save();

  res.json(order);
});

// Bestellung löschen (Admin-only)
router.delete('/:id', authenticate, async (req, res) => {
  // @ts-ignore
  if (req.user.role !== 'admin') {
    return res.status(403).send('Zugriff verweigert: Nur für Administratoren.');
  }

  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).send('Bestellung nicht gefunden.');
    }

    res.status(200).json({ message: 'Bestellung erfolgreich gelöscht.' });
  } catch (error) {
    console.error('Fehler beim Löschen der Bestellung:', error);
    res.status(500).send('Serverfehler beim Löschen der Bestellung.');
  }
});

export default router;
