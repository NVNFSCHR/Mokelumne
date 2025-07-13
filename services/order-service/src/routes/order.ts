import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { Order } from '../models/Order';
import { Coupon } from '../models/Coupon';

const router = express.Router();

// Bestellung erstellen
router.post('/', async (req, res) => {
  const {
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
        const response = await fetch(`http://product-service:3000/api/products/${item.productId}`);

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

  const finalAmount = totalWithoutDiscount - discountAmount;

  const newOrder = new Order({
    userId: null, // Benutzer-ID wird nicht mehr benötigt
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

// Status aktualisieren
router.patch('/:id/status', authenticate, async (req, res) => {
  const { role } = (req as any).user;
  if (role !== 'admin') return res.status(403).send('Forbidden');

  const { status } = req.body;
  if (!['open', 'paid', 'shipped'].includes(status)) {
    return res.status(400).send('Ungültiger Status');
  }

  // PATCH /orders/:id/payment
router.patch('/:id/payment', authenticate, async (req, res) => {
  const { role } = (req as any).user;
  const secret = req.headers['x-webhook-secret'];

  if (role !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(403).send('Invalid Webhook Secret');
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

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!order) return res.status(404).send('Bestellung nicht gefunden');
  res.json(order);
});

export default router;
