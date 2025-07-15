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
    return c.json({ message: 'User not found' }, 404);
  }

  const { passwordHash, refreshToken, ...userProfile } = user.props;

  return c.json(userProfile);
});

export default userRoutes;
