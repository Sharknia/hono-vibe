import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from '@/presentation/routes/auth.routes';
import userRoutes from '@/presentation/routes/user.routes';
import { swaggerUI } from '@hono/swagger-ui';
import { dependencyInjection } from '@/presentation/middlewares/di.middleware';
import { AuthService } from '@/application/services/auth.service';
import { AuthPayload, authMiddleware } from '@/presentation/middlewares/auth.middleware';
import { IUserRepository } from '@/domain/users/user.repository';
import { errorHandler } from './presentation/middlewares/error.middleware';
import { roleMiddleware } from './presentation/middlewares/role.middleware';

// Define the types for the context variables
type AppEnv = {
  Variables: {
    authService: AuthService;
    userRepository: IUserRepository;
    authPayload: AuthPayload;
  };
};

const app = new Hono<AppEnv>();

// --- API Routes ---
const api = new Hono<AppEnv>();

// CORS Middleware
api.use('/*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8787',
    'https://hono-be.furychick0.workers.dev',
    'https://hono-be.tuum.day',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Authorization', 'Content-Type'],
}));

api.use('/*', dependencyInjection);
api.route('/auth', authRoutes);
api.route('/users', userRoutes);
api.get(
  '/admin',
  authMiddleware,
  roleMiddleware('ADMIN'),
  (c) => c.json({ message: 'Welcome, Admin!' })
);

app.route('/api', api);


// --- Standalone Routes ---
app.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Health check successful' });
});


// --- Swagger UI & OpenAPI Specification ---
app.get('/api/doc', swaggerUI({ url: '/api/openapi.json' }));

app.get('/api/openapi.json', (c) => {
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Hono Vibe API',
      version: '1.0.0',
      description: 'API documentation for the Hono Vibe application.',
    },
    servers: [{ url: 'http://localhost:8787', description: 'Local server' }],
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['auth'],
          summary: 'Register a new user',
          description: 'Creates a new user account.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email', example: 'test@example.com' },
                    password: { type: 'string', minLength: 8, example: 'password123' },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'User created successfully' },
                    },
                  },
                },
              },
            },
            '400': { description: 'Bad request (validation error)' },
            '409': { description: 'Conflict (email already exists)' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['auth'],
          summary: 'User login',
          description: 'Authenticates a user and returns tokens.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email', example: 'test@example.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Successful login',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string', example: 'eyJhbGciOi...' },
                      refreshToken: { type: 'string', example: 'eyJhbGciOi...' },
                    },
                  },
                },
              },
            },
            '401': { description: 'Unauthorized (invalid credentials)' },
          },
        },
      },
      '/api/users/me': {
        get: {
          tags: ['users'],
          summary: 'Get my profile',
          description: 'Retrieves the profile of the currently authenticated user.',
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'User profile data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      email: { type: 'string', format: 'email' },
                      nickname: { type: 'string', nullable: true },
                      role: { type: 'string', enum: ['USER', 'ADMIN'] },
                    },
                  },
                },
              },
            },
            '401': { description: 'Unauthorized' },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          tags: ['auth'],
          summary: 'Refresh token',
          description: 'Obtains a new access token and refresh token.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    refreshToken: { type: 'string', example: 'eyJhbGciOi...' },
                  },
                  required: ['refreshToken'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Tokens refreshed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string', example: 'eyJhbGciOi...' },
                      refreshToken: { type: 'string', example: 'eyJhbGciOi...' },
                    },
                  },
                },
              },
            },
            '401': { description: 'Unauthorized (invalid or expired refresh token)' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['auth'],
          summary: 'User logout',
          description: 'Logs out the current user by invalidating the refresh token.',
          security: [{ BearerAuth: [] }],
          responses: {
            '204': { description: 'Logout successful' },
            '401': { description: 'Unauthorized' },
          },
        },
      },
      '/api/admin': {
        get: {
          tags: ['admin'],
          summary: 'Admin-only route',
          description: 'An example endpoint that requires ADMIN role.',
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'Welcome message for admin',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Welcome, Admin!' },
                    },
                  },
                },
              },
            },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden (user is not an admin)' },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  };
  return c.json(openApiSpec);
});


// Register the global error handler
app.onError(errorHandler);

export { app };

export default {
  fetch: app.fetch,
};