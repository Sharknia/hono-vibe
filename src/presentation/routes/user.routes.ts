import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '@/presentation/middlewares/auth.middleware';
import { IUserRepository } from '@/domain/users/user.repository';
import { AuthPayload } from '@/presentation/middlewares/auth.middleware';
import { NotFoundError } from '@/domain/errors';
import { CheckEmailSchema, CheckNicknameSchema } from '../schemas/user.schema';

type AppEnv = {
  Variables: {
    userRepository: IUserRepository;
    authPayload: AuthPayload;
  }
}

const userRoutes = new Hono<AppEnv>();

// --- Public Routes ---
userRoutes.get('/check/nickname/:nickname', zValidator('param', CheckNicknameSchema), async (c) => {
  const { nickname } = c.req.valid('param');
  const repo = c.get('userRepository');
  const user = await repo.findByNickname(nickname);
  return c.json({ isAvailable: !user });
});

userRoutes.get('/check/email/:email', zValidator('param', CheckEmailSchema), async (c) => {
  const { email } = c.req.valid('param');
  const repo = c.get('userRepository');
  const user = await repo.findByEmail(email);
  return c.json({ isAvailable: !user });
});


// --- Protected Routes ---
userRoutes.use('/me', authMiddleware);
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
