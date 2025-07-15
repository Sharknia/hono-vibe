import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { AuthService } from '@/application/services/auth.service';
import { authMiddleware, AuthPayload } from '@/presentation/middlewares/auth.middleware';
import { RegisterRequestSchema } from '../schemas/auth.schema';

type AppEnv = {
  Variables: {
    authService: AuthService;
    authPayload: AuthPayload;
  };
};

const authRoutes = new Hono<AppEnv>();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// Public routes
authRoutes.post('/register', zValidator('json', RegisterRequestSchema), async (c) => {
  const authService = c.var.authService;
  const { email, password, nickname } = c.req.valid('json');
  await authService.signUp({ email, password, nickname });
  return c.json({ message: 'User created successfully' }, 201);
});

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const authService = c.var.authService;
  const { email, password } = c.req.valid('json');
  const tokens = await authService.login({ email, password });
  return c.json(tokens, 200);
});

authRoutes.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const authService = c.var.authService;
  const { refreshToken } = c.req.valid('json');
  const tokens = await authService.refresh(refreshToken);
  return c.json(tokens, 200);
});

// Protected route
authRoutes.use('/logout', authMiddleware);
authRoutes.post('/logout', async (c) => {
  const authService = c.var.authService;
  const { userId } = c.get('authPayload');
  await authService.logout(userId);
  return c.body(null, 204);
});

export default authRoutes;
