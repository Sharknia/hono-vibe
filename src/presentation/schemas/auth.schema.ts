import { z } from '@hono/zod-openapi';

// 문서화 및 유효성 검사 스키마
export const RegisterRequestSchema = z.object({
  email: z.string().email().openapi({
    example: 'test@example.com',
  }),
  password: z.string().min(8).openapi({
    example: 'password123',
  }),
  nickname: z.string().min(3).max(20).openapi({
    example: 'testuser',
  }),
}).openapi({
  type: 'object',
  title: 'RegisterRequest',
});

export const LoginRequestSchema = z.object({
  email: z.string().email().openapi({
    example: 'test@example.com',
  }),
  password: z.string().openapi({
    example: 'password123',
  }),
}).openapi({
    type: 'object',
    title: 'LoginRequest',
});

// 응답 스키마
export const RegisterResponseSchema = z.object({
  message: z.string().openapi({
    example: 'User created successfully',
  }),
}).openapi({
    type: 'object',
    title: 'RegisterResponse',
    description: 'Response after successful registration',
});

export const LoginResponseSchema = z.object({
  accessToken: z.string().openapi({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Access Token',
  }),
  refreshToken: z.string().openapi({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Refresh Token',
  }),
}).openapi({
    type: 'object',
    title: 'LoginResponse',
});
