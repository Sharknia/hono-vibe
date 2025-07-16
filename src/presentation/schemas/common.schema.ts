import { z } from '@hono/zod-openapi';

export const ErrorSchema = z.object({
  statusCode: z.number().int().openapi({
    example: 400,
    description: 'HTTP status code',
  }),
  error: z.string().openapi({
    example: 'Bad Request',
    description: 'Error type',
  }),
  message: z.string().openapi({
    example: 'Invalid input provided',
    description: 'Error message',
  }),
}).openapi('ErrorResponse', {
  description: 'Standard error response format',
});
