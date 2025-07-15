/**
 * Custom error class for handling HTTP-specific errors.
 * It allows specifying an HTTP status code along with a message.
 */
export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

// You can define more specific error classes if needed
export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}

export class DuplicateEmailError extends ConflictError {
  constructor(message = 'Email already in use') {
    super(message);
  }
}

export class DuplicateNicknameError extends ConflictError {
  constructor(message = 'Nickname already in use') {
    super(message);
  }
}
