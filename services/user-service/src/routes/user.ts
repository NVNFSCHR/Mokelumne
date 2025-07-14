import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { User, IUser } from '../models/User';
import admin from '../firebase';

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

router.get('/all', authenticate, async (req, res) => {
  const { uid } = (req as any).user;
  const currentUser = await User.findOne({ firebaseUid: uid });

  if (currentUser?.role !== 'admin') {
    return res.status(403).send('Forbidden: Admin access required');
  }

  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Benutzer suchen (Admin-only)
router.get('/search', authenticate, async (req, res) => {
  const { uid } = (req as any).user;
  const currentUser = await User.findOne({ firebaseUid: uid });

  if (currentUser?.role !== 'admin') {
    return res.status(403).send('Forbidden: Admin access required');
  }

  try {
    const { query, role } = req.query;
    const searchQuery: any = {};

    if (query && typeof query === 'string') {
      const searchRegex = new RegExp(query, 'i');
      searchQuery.$or = [
        { email: searchRegex },
        { name: searchRegex },
        { first_name: searchRegex },
        { last_name: searchRegex }
      ];
    }

    if (role && typeof role === 'string') {
      searchQuery.role = role;
    }

    const users = await User.find(searchQuery).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Benutzerrolle ändern (Admin-only)
router.patch('/:userId/role', authenticate, async (req, res) => {
  const { uid } = (req as any).user;
  const currentUser = await User.findOne({ firebaseUid: uid });

  // Explizite Prüfung, um den Typ für TypeScript einzugrenzen
  if (!currentUser || currentUser.role !== 'admin') {
    return res.status(403).send('Forbidden: Admin access required');
  }

  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Verhindere, dass sich ein Admin selbst degradiert
    if (userId === currentUser._id.toString() && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot change your own admin role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).send('Internal Server Error');
  }
});

// DELETE /api/user/:userId - Benutzer löschen
router.delete('/:userId', authenticate, async (req, res) => {
  const { uid } = (req as any).user;
  const { userId } = req.params;

  try {
    // Aktuellen Benutzer aus der Datenbank laden
    const currentUser = await User.findOne({ firebaseUid: uid });
    if (!currentUser) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // User zu löschenden User laden
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ error: 'Zu löschender Benutzer nicht gefunden' });
    }

    // Berechtigung prüfen: Nur Admin oder der Benutzer selbst
    const isAdmin = currentUser.role === 'admin';
    const isSelfDelete = userId === currentUser._id.toString();

    if (!isAdmin && !isSelfDelete) {
      return res.status(403).json({ error: 'Nicht berechtigt' });
    }

    // Bei Admin-Löschung durch anderen Admin: Prüfung ob letzter Admin
    if (isAdmin && userToDelete.role === 'admin' && !isSelfDelete) {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          error: 'Der letzte Administrator kann nicht gelöscht werden'
        });
      }
    }

    // Bei Selbstlöschung: Prüfung ob letzter Admin
    if (isSelfDelete && currentUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          error: 'Als letzter Administrator können Sie Ihr Konto nicht löschen'
        });
      }
    }

    // Firebase User löschen (nur bei Selbstlöschung)
    if (isSelfDelete) {
      try {
        await admin.auth().deleteUser(userToDelete.firebaseUid);
        console.log('✅ Firebase User gelöscht:', userToDelete.firebaseUid);
      } catch (firebaseError) {
        console.error('❌ Fehler beim Löschen des Firebase Users:', firebaseError);
        // Firebase-Fehler nicht blockierend, da User eventuell bereits gelöscht
      }
    }

    // User aus der Datenbank löschen
    await User.findByIdAndDelete(userId);
    console.log('✅ User aus Datenbank gelöscht:', userId);

    res.json({
      success: true,
      message: isSelfDelete ? 'Konto erfolgreich gelöscht' : 'Benutzer erfolgreich gelöscht'
    });

  } catch (error) {
    console.error('❌ Fehler beim Löschen des Benutzers:', error);
    res.status(500).json({ error: 'Serverfehler beim Löschen des Benutzers' });
  }
});

export default router;
