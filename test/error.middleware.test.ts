import { Hono } from 'hono';
import { z } from 'zod';
import { errorHandler } from '@/presentation/middlewares/error.middleware';
import { NotFoundError } from '@/domain/errors';
import { describe, it, expect } from 'vitest';
import { ErrorSchema } from '@/presentation/schemas/common.schema';

describe('Error Handler Middleware', () => {
  const app = new Hono();

  app.get('/not-found-error', () => {
    throw new NotFoundError('Custom Not Found Message');
  });

  app.get('/generic-error', () => {
    throw new Error('A generic error occurred');
  });

  app.get('/zod-error', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number({
        required_error: 'age is Required',
        invalid_type_error: 'age must be a number',
      }),
    });
    // This will throw a ZodError because 'age' is missing
    schema.parse({ name: 'test' });
  });

  app.onError(errorHandler);

  it('should handle HttpError (NotFoundError) and format response using ErrorSchema', async () => {
    const res = await app.request('/not-found-error');
    expect(res.status).toBe(404);
    
    const json = await res.json();
    const validation = ErrorSchema.safeParse(json);
    
    expect(validation.success).toBe(true);
    expect(json.statusCode).toBe(404);
    expect(json.error).toBe('NotFound');
    expect(json.message).toBe('Custom Not Found Message');
  });

  it('should handle generic Error and format response using ErrorSchema', async () => {
    const res = await app.request('/generic-error');
    expect(res.status).toBe(500);

    const json = await res.json();
    const validation = ErrorSchema.safeParse(json);

    expect(validation.success).toBe(true);
    expect(json.statusCode).toBe(500);
    expect(json.error).toBe('Internal Server Error');
    expect(json.message).toBe('A generic error occurred');
  });

  it('should handle ZodError and format response using ErrorSchema', async () => {
    const res = await app.request('/zod-error');
    expect(res.status).toBe(400);

    const json = await res.json();
    const validation = ErrorSchema.safeParse(json);

    expect(validation.success).toBe(true);
    expect(json.statusCode).toBe(400);
    expect(json.error).toBe('Bad Request');
    expect(json.message).toContain('age: Invalid input: expected number, received undefined');
  });
});
