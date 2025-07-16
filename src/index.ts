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
import { ErrorResponseComponent } from '@/presentation/schemas/common.schema';

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
  const env = c.env.ENV || 'local'; // Default to 'local' if ENV is not set
  const serverUrl = env === 'prod' 
    ? 'https://hono-be.furychick0.workers.dev' 
    : 'http://localhost:8787';
  const serverDescription = env === 'prod' 
    ? 'Production Server' 
    : 'Local Server';

  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Hono Vibe API',
      version: '1.0.0',
      description: 'API documentation for the Hono Vibe application.',
    },
    servers: [{ url: serverUrl, description: serverDescription }],
    paths: {
      '/health': {
        get: {
          tags: ['health'],
          summary: 'Health check',
          description: 'Checks if the service is running.',
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      message: { type: 'string', example: 'Health check successful' },
                    },
                  },
                },
              },
            },
          },
        },
      },
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
                    nickname: { type: 'string', minLength: 2, maxLength: 20, example: 'testuser' },
                  },
                  required: ['email', 'password', 'nickname'],
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
            '400': { '$ref': '#/components/responses/BadRequest' },
            '409': { '$ref': '#/components/responses/Conflict' },
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
            '401': { '$ref': '#/components/responses/Unauthorized' },
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
            '401': { '$ref': '#/components/responses/Unauthorized' },
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
            '401': { '$ref': '#/components/responses/Unauthorized' },
          },
        },
      },
      '/api/users/check/nickname/{nickname}': {
        get: {
          tags: ['users'],
          summary: 'Check nickname availability',
          description: 'Checks if a nickname is already taken.',
          parameters: [
            {
              name: 'nickname',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                minLength: 2,
                maxLength: 20,
              },
              description: 'The nickname to check.',
            },
          ],
          responses: {
            '200': {
              description: 'Availability status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      isAvailable: { type: 'boolean' },
                    },
                  },
                },
              },
            },
            '400': { '$ref': '#/components/responses/BadRequest' },
          },
        },
      },
      '/api/users/check/email/{email}': {
        get: {
          tags: ['users'],
          summary: 'Check email availability',
          description: 'Checks if an email is already registered.',
          parameters: [
            {
              name: 'email',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                format: 'email',
              },
              description: 'The email to check.',
            },
          ],
          responses: {
            '200': {
              description: 'Availability status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      isAvailable: { type: 'boolean' },
                    },
                  },
                },
              },
            },
            '400': { '$ref': '#/components/responses/BadRequest' },
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
            '401': { '$ref': '#/components/responses/Unauthorized' },
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
            '401': { '$ref': '#/components/responses/Unauthorized' },
            '403': { '$ref': '#/components/responses/Forbidden' },
          },
        },
      },
    },
    components: {
      schemas: {
        ...ErrorResponseComponent
      },
      responses: {
        BadRequest: {
          description: 'Bad Request',
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } },
        },
        Unauthorized: {
          description: 'Unauthorized',
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } },
        },
        Forbidden: {
          description: 'Forbidden',
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } },
        },
        Conflict: {
          description: 'Conflict',
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } },
        },
      },
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