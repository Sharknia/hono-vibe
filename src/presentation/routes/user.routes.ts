import { Hono } from 'hono';
import { authMiddleware } from '@/presentation/middlewares/auth.middleware';
import { IUserRepository } from '@/domain/users/user.repository';
import { AuthPayload } from '@/presentation/middlewares/auth.middleware';

type AppEnv = {
  Variables: {
    userRepository: IUserRepository;
    authPayload: AuthPayload;
  }
}

const userRoutes = new Hono<AppEnv>();

// Protect all user routes with the auth middleware
userRoutes.use('/*', authMiddleware);

userRoutes.get('/me', async (c) => {
  const { userId } = c.get('authPayload');
  const repo = c.get('userRepository');
  
  const user = await repo.findById(userId);

  if (!user) {
    // This case is unlikely if auth middleware is effective, but it's a good safeguard.
    throw new NotFoundError('User not found');
  }

  return c.json(user.toProfile());
});

export default userRoutes;
