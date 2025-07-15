import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { UnauthorizedError } from '@/domain/errors';

// Define the type for the payload we store in the context
export type AuthPayload = {
  userId: string;
  role: 'USER' | 'ADMIN';
};

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Unauthorized: No token provided');
  }

  const token = authHeader.substring(7);
  const secret = c.env.JWT_ACCESS_SECRET as string;

  if (!secret) {
    // This is a server configuration issue, so a generic error is appropriate.
    throw new Error('JWT_ACCESS_SECRET is not set in the environment.');
  }

  try {
    const payload = await verify(token, secret);
    if (!payload || !payload.sub) {
      throw new UnauthorizedError('Unauthorized: Invalid token payload');
    }
    
    c.set('authPayload', {
      userId: payload.sub as string,
      role: payload.role as 'USER' | 'ADMIN',
    });

    await next();

  } catch (error) {
    // Re-throw specific known errors, otherwise throw a generic unauthorized error.
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Unauthorized: Invalid or expired token');
  }
});
