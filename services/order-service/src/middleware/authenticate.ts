import admin from '../firebase';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).user = { uid: decoded.uid, role: await getUserRole(token) || 'customer' };
    next();
  } catch {
    res.status(403).send('Invalid token');
  }
};

export async function getUserRole(token: string | undefined): Promise<boolean> {
  try {
    const response = await axios.get('http://user-service.mokelumne.svc.cluster.local:3000/api/user/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const user = response.data;
    return user.role
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzerrolle:', error);
    return false;
  }
}


