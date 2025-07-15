import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email().openapi({
    example: 'test@example.com',
  }),
  password: z.string().min(8).openapi({
    example: 'password123',
  }),
});

export const RegisterRequestSchema = z.object({
  username: z.string().min(3).openapi({
    example: 'testuser',
  }),
  email: z.string().email().openapi({
    example: 'test@example.com',
  }),
  password: z.string().min(8).openapi({
    example: 'password123',
  }),
});

export const AuthResponseSchema = z.object({
  token: z.string().openapi({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  }),
  user: z.object({
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
  }),
});
