// src/server.ts
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3000';

app.post('api/pay', async (req, res) => {
  const { orderId, amount, method } = req.body;
  const mode = req.query.mode || 'success';   // ?mode=fail  oder ?mode=delay
  const paymentId = 'pay_' + Math.random().toString(36).substring(2, 9);

  // Sofort Antwort ans Frontend
  res.json({ paymentId, status: mode === 'fail' ? 'failed' : 'processing' });

  const webhookBody = {
    status: mode === 'fail' ? 'failed' : 'paid'
  };

  // Verzögerung simulieren
  const delayMs = mode === 'delay' ? 5000 : 1000;
  setTimeout(async () => {
    try {
      await axios.patch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/payment`, {
        status: 'paid'
      }, {
        headers: {
          'x-webhook-secret': process.env.WEBHOOK_SECRET
        }
      });
      console.log(`[MockPay] Webhook sent for order ${orderId} (${webhookBody.status})`);
    } catch (err) {
      if (err instanceof Error) {
        console.error('[MockPay] Webhook error:', err.message);
      } else {
        console.error('[MockPay] Webhook error:', err);
}
    }
  }, delayMs);
});

app.listen(4000, () => console.log('Mock-Payment-Service läuft auf Port 4000'));
