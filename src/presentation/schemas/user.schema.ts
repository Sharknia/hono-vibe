import { z } from 'zod';

export const UserProfileSchema = z.object({
  id: z.string().uuid().openapi({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  }),
  email: z.string().email().openapi({
    example: 'test@example.com',
  }),
  nickname: z.string().nullable().openapi({
    example: 'testuser',
  }),
  role: z.enum(['USER', 'ADMIN']).openapi({
    example: 'USER',
  }),
}).openapi({
    type: 'object',
    title: 'UserProfile',
});
