import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { AuthService } from '@/application/services/auth.service';
import { authMiddleware, AuthPayload } from '@/presentation/middlewares/auth.middleware';

type AppEnv = {
  Variables: {
    authService: AuthService;
    authPayload: AuthPayload;
  };
};

const authRoutes = new Hono<AppEnv>();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// Public routes
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const authService = c.var.authService;
  const { email, password } = c.req.valid('json');
  const result = await authService.register({ email, password });
  return c.json({ message: result.message }, result.statusCode);
});

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const authService = c.var.authService;
  const { email, password } = c.req.valid('json');
  const result = await authService.login({ email, password });
  if (!result.success) {
    return c.json({ message: result.message }, result.statusCode);
  }
  return c.json(result.data, result.statusCode);
});

authRoutes.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const authService = c.var.authService;
  const { refreshToken } = c.req.valid('json');
  const result = await authService.refresh(refreshToken);
  if (!result.success) {
    return c.json({ message: result.message }, result.statusCode);
  }
  return c.json(result.data, result.statusCode);
});

// Protected route
authRoutes.use('/logout', authMiddleware);
authRoutes.post('/logout', async (c) => {
  const authService = c.var.authService;
  const { userId } = c.get('authPayload');
  const result = await authService.logout(userId);
  return c.json({ message: result.message }, result.statusCode);
});

export default authRoutes;
