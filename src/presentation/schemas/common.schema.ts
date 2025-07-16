import { z } from '@hono/zod-openapi';

export const ErrorSchema = z.object({
  statusCode: z.number().int(),
  error: z.string(),
  message: z.string(),
});

// For manual OpenAPI documentation
export const ErrorResponseComponent = {
  ErrorResponse: {
    type: 'object',
    properties: {
      statusCode: {
        type: 'integer',
        example: 400,
        description: 'HTTP status code',
      },
      error: {
        type: 'string',
        example: 'Bad Request',
        description: 'Error type',
      },
      message: {
        type: 'string',
        example: 'Invalid input provided',
        description: 'Error message',
      },
    },
    required: ['statusCode', 'error', 'message'],
  },
};

export const SuccessSchema = z.object({
  message: z.string().openapi({
    example: 'Operation successful',
    description: 'Success message',
  }),
}).openapi({
    type: 'object',
    title: 'SuccessResponse',
    description: 'Standard success response',
});
