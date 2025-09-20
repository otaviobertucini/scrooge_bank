import { type Response, type NextFunction } from 'express';
import { PrismaClient, Role } from '../generated/prisma/index.js';
import { type Request } from 'express';
import { AuthorizationError, sFoxError, ValidationError } from './utils/errors.js';

const prisma = new PrismaClient();

interface ErrorResponse {
  error: string;
  code?: string;
  message?: string;
  fields?: Array<{
    field: string;
    reason: string;
    receivedValue?: any;
  }>;
  details?: any;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthorizationError('Unauthorized: Bearer token is required', 'TOKEN_REQUIRED');
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    throw new AuthorizationError('Unauthorized: Token is missing', 'TOKEN_MISSING');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { token },
    });

    if (!user) {
      throw new AuthorizationError('Unauthorized: Invalid token', 'INVALID_TOKEN');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const isOperator = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== Role.OPERATOR) {
    throw new AuthorizationError('You do not have permission to access this resource.', 'INSUFFICIENT_PERMISSIONS');
  }
  next();
};

export const isCustomer = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== Role.CUSTOMER) {
    throw new AuthorizationError('This action is reserved for customers.', 'INSUFFICIENT_PERMISSIONS');
  }
  next();
};

export const errorHandlerMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.log(`🚀 ~ errorHandlerMiddleware ~ error:`, error)
  let statusCode = 500;
  let errorResponse: ErrorResponse = {
    error: 'Internal server error',
    message: 'An unexpected error occurred',
  };

  if (error instanceof sFoxError) {
    statusCode = error.statusCode;
    errorResponse = {
      error: error.message,
      code: error.code,
    };
  }

  if (error instanceof ValidationError) {
    errorResponse = {
      ...errorResponse,
      fields: error.fields,
    };
  }

  res.status(statusCode).json(errorResponse);
};
