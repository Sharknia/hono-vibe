import { ErrorHandler } from 'hono';
import { HttpError } from '@/domain/errors';
import { ZodError } from 'zod';
import { HTTPException } from 'hono/http-exception';

export const errorHandler: ErrorHandler = (err, c) => {
  // Log the error for debugging purposes, except for known HTTP errors
  if (!(err instanceof HttpError) && !(err instanceof HTTPException)) {
    console.error('An unexpected error occurred:', err);
  }

  if (err instanceof HttpError) {
    const errorName = err.name.replace(/Error$/, '');
    return c.json({
      statusCode: err.statusCode,
      error: errorName,
      message: err.message,
    }, err.statusCode);
  }

  if (err instanceof ZodError) {
    const message = err.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    return c.json({
      statusCode: 400,
      error: 'Bad Request',
      message: message,
    }, 400);
  }
  
  if (err instanceof HTTPException) {
    return c.json({
        statusCode: err.status,
        error: err.name,
        message: err.message,
    }, err.status)
  }

  // For unexpected generic errors
  const error = err as Error;
  return c.json({
    statusCode: 500,
    error: 'Internal Server Error',
    message: error.message || 'An unexpected error occurred.',
  }, 500);
};
