import { z } from 'zod';

export const UserProfileSchema = z.object({
  id: z.string().uuid().openapi({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  }),
  username: z.string().openapi({
    example: 'testuser',
  }),
  email: z.string().email().openapi({
    example: 'test@example.com',
  }),
  role: z.enum(['USER', 'ADMIN']).openapi({
    example: 'USER',
  }),
  createdAt: z.string().datetime().openapi({
    example: '2025-07-15T10:00:00.000Z',
  }),
  updatedAt: z.string().datetime().openapi({
    example: '2025-07-15T10:00:00.000Z',
  }),
});
