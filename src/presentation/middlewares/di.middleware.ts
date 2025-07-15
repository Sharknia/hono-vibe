import { createMiddleware } from 'hono/factory';
import { DrizzleUserRepository } from '@/infrastructure/repositories/drizzle.user.repository';
import { AuthService } from '@/application/services/auth.service';
import { IUserRepository } from '@/domain/users/user.repository';

export const dependencyInjection = createMiddleware(async (c, next) => {
  // For each request, a new repository and service instance is created.
  const userRepository: IUserRepository = new DrizzleUserRepository(c.env);
  
  const accessSecret = c.env.JWT_ACCESS_SECRET as string;
  const refreshSecret = c.env.JWT_REFRESH_SECRET as string;
  const authService = new AuthService(userRepository, accessSecret, refreshSecret);

  // Store instances in the context
  c.set('userRepository', userRepository);
  c.set('authService', authService);
  
  await next();
});