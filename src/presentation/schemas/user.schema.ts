import { z } from '@hono/zod-openapi';

export const UserProfileSchema = z.object({
  id: z.string().uuid().openapi({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  }),
  email: z.string().email().openapi({
    example: 'test@example.com',
  }),
  nickname: z.string().openapi({
    example: 'testuser',
  }),
  role: z.enum(['USER', 'ADMIN']).openapi({
    example: 'USER',
  }),
}).openapi({
    type: 'object',
    title: 'UserProfile',
});

export const CheckAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
}).openapi({
  type: 'object',
  title: 'CheckAvailabilityResponse',
});

export const CheckNicknameSchema = z.object({
  nickname: z.string().min(3).max(20),
});

export const CheckEmailSchema = z.object({
  email: z.string().email(),
});
