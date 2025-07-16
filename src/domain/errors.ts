/**
 * Custom error class for handling HTTP-specific errors.
 * It allows specifying an HTTP status code along with a message.
 */
export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

// You can define more specific error classes if needed
export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

export class DuplicateEmailError extends ConflictError {
  constructor(message = 'Email already in use') {
    super(message);
    this.name = 'DuplicateEmailError';
  }
}

export class DuplicateNicknameError extends ConflictError {
  constructor(message = 'Nickname already in use') {
    super(message);
    this.name = 'DuplicateNicknameError';
  }
}
