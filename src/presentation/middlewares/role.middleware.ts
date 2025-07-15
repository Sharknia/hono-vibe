import { createMiddleware } from 'hono/factory';
import { AuthPayload } from './auth.middleware';

type UserRole = 'USER' | 'ADMIN';

export const roleMiddleware = (requiredRole: UserRole) => {
  return createMiddleware(async (c, next) => {
    const payload = c.get('authPayload');

    if (!payload) {
      // This should technically be handled by authMiddleware running first,
      // but as a safeguard:
      return c.json({ message: 'Not authenticated' }, 401);
    }

    if (payload.role !== requiredRole) {
      return c.json({ message: 'Forbidden' }, 403);
    }

    await next();
  });
};
