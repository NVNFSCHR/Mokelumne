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

// Benutzer löschen (Admin-only)
router.delete('/:userId', authenticate, async (req, res) => {
  const { uid } = (req as any).user;
  const currentUser = await User.findOne({ firebaseUid: uid }) as IUser;

  if (!currentUser || currentUser.role !== 'admin') {
    return res.status(403).send('Forbidden: Admin access required');
  }

  try {
    const { userId } = req.params;

    if (userId === currentUser._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Erst den User aus MongoDB holen um firebaseUid zu bekommen
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Firebase User löschen
    try {
      await admin.auth().deleteUser(userToDelete.firebaseUid);
      console.log(`Firebase user deleted: ${userToDelete.firebaseUid}`);
    } catch (firebaseError) {
      console.error('Error deleting Firebase user:', firebaseError);
      // Optional: return error or continue with MongoDB deletion
    }

    // MongoDB User löschen
    const deletedUser = await User.findByIdAndDelete(userId);
    res.json({ message: 'User successfully deleted from both Firebase and database' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
