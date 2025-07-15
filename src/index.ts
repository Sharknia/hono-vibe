import { Hono } from 'hono';
import authRoutes from '@/presentation/routes/auth.routes';
import userRoutes from '@/presentation/routes/user.routes';
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

// Apply dependency injection middleware to API routes
app.use('/api/*', dependencyInjection);

// Health Check Route
app.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Health check successful' });
});

// API Routes
const api = app.basePath('/api');
api.route('/auth', authRoutes);
api.route('/users', userRoutes);

// Admin Route Example
api.get(
  '/admin',
  authMiddleware,
  roleMiddleware('ADMIN'),
  (c) => c.json({ message: 'Welcome, Admin!' })
);

// Register the global error handler
app.onError(errorHandler);

export { app };

export default {
  fetch: app.fetch,
};
