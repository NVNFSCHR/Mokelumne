import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { User } from '../models/User';

const router = express.Router();

// Abrufen oder Erstellen des eigenen Profils
router.get('/me', authenticate, async (req, res) => {
  const { uid, email, name } = (req as any).user;
  try {
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Prüfe bei Erstellung ob DEFAULT_ADMIN_UID
      const role = uid === process.env.DEFAULT_ADMIN_UID ? 'admin' : 'customer';

      user = new User({
        firebaseUid: uid,
        email,
        name: name || email,
        role
      });
      await user.save();
      console.log(`✅ Neuer ${role} erstellt (UID):`, email);
      return res.status(201).json(user);
    }

    // Auto-Upgrade für DEFAULT_ADMIN_UID bei jedem Login
    if (uid === process.env.DEFAULT_ADMIN_UID && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
      console.log('✅ Automatisches Admin-Upgrade bei Login (UID):', email);
    }

    res.json(user);
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Admin-only Zugriff prüfen
router.get('/admin-area', authenticate, async (req, res) => {
  const { uid } = (req as any).user;
  const user = await User.findOne({ firebaseUid: uid });
  if (user?.role !== 'admin') return res.status(403).send('Forbidden');
  res.send('Welcome Admin!');
});

// Update eigener Profildaten
router.put('/me', authenticate, async (req, res) => {
  const { uid } = (req as any).user;
  const { title, name, first_name, last_name, phoneNumber, address } = req.body;

  const user = await User.findOneAndUpdate(
    { firebaseUid: uid },
    { $set: { title, name, first_name, last_name, phoneNumber, address } },
    { new: true }
  );

  if (!user) return res.status(404).send('User not found');
  res.json(user);
});

export default router;
