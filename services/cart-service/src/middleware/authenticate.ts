import admin from '../firebase';
import { Request, Response, NextFunction } from 'express';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('No token provided');

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).user = { uid: decoded.uid };
    next();
  } catch {
    res.status(403).send('Invalid token');
  }
};
