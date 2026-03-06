import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export type AuthPayload = { userId: string; role: string };

export function verifyAuthHeader(authHeader: string | undefined): AuthPayload {
  if (!authHeader) throw new Error('unauthorized');
  const [scheme, token] = authHeader.split(' ');
  if (!token || scheme.toLowerCase() !== 'bearer') throw new Error('unauthorized');
  const decoded = jwt.verify(token, config.jwtSecret) as any;
  if (!decoded?.userId) throw new Error('unauthorized');
  return { userId: String(decoded.userId), role: String(decoded.role ?? 'user') };
}
