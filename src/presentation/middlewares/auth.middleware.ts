import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';

// Define the type for the payload we store in the context
export type AuthPayload = {
  userId: string;
  role: 'USER' | 'ADMIN';
};

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.substring(7);
  const secret = c.env.JWT_ACCESS_SECRET as string;

  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not set in the environment.');
  }

  try {
    const payload = await verify(token, secret);
    if (!payload || !payload.sub) {
      return c.json({ message: 'Unauthorized: Invalid token payload' }, 401);
    }
    
    c.set('authPayload', {
      userId: payload.sub as string,
      role: payload.role as 'USER' | 'ADMIN',
    });

    await next();

  } catch (error) {
    return c.json({ message: 'Unauthorized: Invalid or expired token' }, 401);
  }
});