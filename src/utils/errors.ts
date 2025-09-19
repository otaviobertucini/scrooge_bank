export class sFoxError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface ValidationFieldError {
  field: string;
  reason: string;
  receivedValue?: any;
}

export class ValidationError extends sFoxError {
  constructor(
    message: string,
    public code: string,
    public fields: ValidationFieldError[]
  ) {
    super(message, 400, code);
  }
}

export class AuthenticationError extends sFoxError {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHENTICATED') {
    super(message, 401, code);
  }
}

export class AuthorizationError extends sFoxError {
  constructor(message: string = 'Forbidden', code: string = 'UNAUTHORIZED') {
    super(message, 403, code);
  }
}

export class NotFoundError extends sFoxError {
  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ConflictError extends sFoxError {
  constructor(message: string = 'Resource already exists', code: string = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class InsufficientFundsError extends sFoxError {
  constructor(message: string = 'Insufficient funds', code: string = 'INSUFFICIENT_FUNDS') {
    super(message, 400, code);
  }
}