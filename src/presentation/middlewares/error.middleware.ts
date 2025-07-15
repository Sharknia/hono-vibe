import { ErrorHandler } from 'hono';
import { HttpError } from '@/domain/errors';

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HttpError) {
    return c.json({ message: err.message }, err.statusCode);
  }

  // For unexpected errors, log them and return a generic 500 response
  console.error('An unexpected error occurred:', err);
  return c.json({ message: 'Internal Server Error' }, 500);
};
