import { z } from 'zod';

export const ErrorSchema = z.object({
  code: z.number().int().positive().openapi({
    example: 404,
    description: 'Error code',
  }),
  message: z.string().openapi({
    example: 'Not Found',
    description: 'Error message',
  }),
}).openapi({
    type: 'object',
    title: 'ErrorResponse',
    description: 'Standard error response',
});
