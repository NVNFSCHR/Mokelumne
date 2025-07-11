import { Request, Response, NextFunction } from 'express';
import admin from '../firebase';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).send('Unauthorized');

  const token = header.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch {
    res.status(403).send('Invalid token');
  }
};
