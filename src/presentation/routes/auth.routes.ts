import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { AuthService } from '@/application/services/auth.service';
import { authMiddleware, AuthPayload } from '@/presentation/middlewares/auth.middleware';
import {
  RegisterRequestSchema,
  RegisterResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
} from '@/presentation/schemas/auth.schema';
import { ErrorSchema } from '@/presentation/schemas/common.schema';

type AppEnv = {
  Variables: {
    authService: AuthService;
    authPayload: AuthPayload;
  };
};

const authRoutes = new OpenAPIHono<AppEnv>();

// --- Documented Routes ---

const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created successfully',
      content: {
        'application/json': {
          schema: RegisterResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request (validation error)',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    409: {
      description: 'Conflict (email already exists)',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

authRoutes.openapi(registerRoute, async (c) => {
  const authService = c.var.authService;
  const { email, password } = c.req.valid('json');
  await authService.register({ email, password });
  return c.json({ message: 'User created successfully' }, 201);
});


const loginRoute = createRoute({
    method: 'post',
    path: '/login',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: LoginRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Successful login',
            content: {
                'application/json': {
                    schema: LoginResponseSchema,
                },
            },
        },
        400: {
            description: 'Bad request (validation error)',
            content: { 'application/json': { schema: ErrorSchema } },
        },
        401: {
            description: 'Unauthorized (invalid credentials)',
            content: { 'application/json': { schema: ErrorSchema } },
        },
    },
});

authRoutes.openapi(loginRoute, async (c) => {
    const authService = c.var.authService;
    const { email, password } = c.req.valid('json');
    const tokens = await authService.login({ email, password });
    return c.json(tokens, 200);
});


// --- Undocumented Routes (Original functionality remains) ---

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// Public routes
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
