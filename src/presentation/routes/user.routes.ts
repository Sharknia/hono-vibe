import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '@/presentation/middlewares/auth.middleware';
import { IUserRepository } from '@/domain/users/user.repository';
import { AuthPayload } from '@/presentation/middlewares/auth.middleware';
import { UserProfileSchema } from '@/presentation/schemas/user.schema';
import { ErrorSchema } from '@/presentation/schemas/common.schema';
import { NotFoundError } from '@/domain/errors';

type AppEnv = {
  Variables: {
    userRepository: IUserRepository;
    authPayload: AuthPayload;
  }
}

const userRoutes = new OpenAPIHono<AppEnv>();

// Protect all user routes with the auth middleware
userRoutes.use('/*', authMiddleware);

const getMyProfileRoute = createRoute({
  method: 'get',
  path: '/me',
  security: [{ BearerAuth: [] }], // This references a security scheme we'll define globally
  responses: {
    200: {
      description: 'User profile data',
      content: {
        'application/json': {
          schema: UserProfileSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'User not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

userRoutes.openapi(getMyProfileRoute, async (c) => {
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
