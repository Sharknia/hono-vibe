import { Hono } from 'hono';
import { errorHandler } from '@/presentation/middlewares/error.middleware';
import { HttpError } from '@/domain/errors';
import { describe, it, expect } from 'vitest';

describe('Error Handler Middleware', () => {
  const app = new Hono();

  // Test route that throws a specific HttpError
  app.get('/test-error', (c) => {
    throw new HttpError(404, 'Not Found Test');
  });

  // Test route that throws a generic error
  app.get('/generic-error', (c) => {
    throw new Error('Something went wrong');
  });
  
  // Apply the error handler
  app.onError(errorHandler);

  it('should handle HttpError and return correct status and message', async () => {
    const res = await app.request('/test-error');
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.message).toBe('Not Found Test');
  });

  it('should handle generic Error and return 500 status', async () => {
    const res = await app.request('/generic-error');
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.message).toBe('Internal Server Error');
  });
});
