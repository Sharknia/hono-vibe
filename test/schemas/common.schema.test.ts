import { describe, it, expect } from 'vitest';
import { ErrorSchema } from '@/presentation/schemas/common.schema';

describe('Common Schemas', () => {
  describe('ErrorSchema', () => {
    it('should validate a correct error object', () => {
      const validError = {
        statusCode: 404,
        error: 'Not Found',
        message: 'The requested resource was not found.',
      };
      const result = ErrorSchema.safeParse(validError);
      expect(result.success).toBe(true);
    });

    it('should fail if statusCode is not an integer', () => {
      const invalidError = {
        statusCode: 400.5,
        error: 'Bad Request',
        message: 'Invalid status code.',
      };
      const result = ErrorSchema.safeParse(invalidError);
      expect(result.success).toBe(false);
    });

    it('should fail if error is missing', () => {
      const invalidError = {
        statusCode: 500,
        message: 'Internal server error.',
      };
      const result = ErrorSchema.safeParse(invalidError);
      expect(result.success).toBe(false);
    });

    it('should fail if message is not a string', () => {
      const invalidError = {
        statusCode: 401,
        error: 'Unauthorized',
        message: 12345,
      };
      const result = ErrorSchema.safeParse(invalidError);
      expect(result.success).toBe(false);
    });
  });
});
