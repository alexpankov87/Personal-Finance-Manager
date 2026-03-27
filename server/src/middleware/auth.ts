import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('🔐 authMiddleware called');
  const authHeader = req.headers.authorization;
  console.log('📨 Authorization header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No token or wrong format');
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔑 Token received:', token.substring(0, 30) + '...');
  console.log('🔐 JWT_SECRET exists?', !!JWT_SECRET);
  
  if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined in environment!');
    return res.status(500).json({ message: 'Server configuration error' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log('✅ Decoded userId:', decoded.userId);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('❌ JWT verification failed:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};