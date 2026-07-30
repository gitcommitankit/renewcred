import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
    });
    return;
  }

  // Prisma known errors
  const prismaError = err as any;
  if (prismaError.name === 'PrismaClientKnownRequestError') {
    if (prismaError.code === 'P2002') {
      const target = (prismaError.meta?.target as string[])?.join(', ') || 'field';
      res.status(409).json({
        success: false,
        statusCode: 409,
        message: `A record with this ${target} already exists`,
      });
      return;
    }

    if (prismaError.code === 'P2025' || prismaError.code === 'P2003') {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: prismaError.code === 'P2003' ? 'Related record not found' : 'Record not found',
      });
      return;
    }

    if (prismaError.code === 'P2014') {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'The change violates a required relation between records',
      });
      return;
    }

    if (prismaError.code === 'P2024') {
      res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Database connection pool timeout — please try again shortly',
      });
      return;
    }
  }

  // Unexpected error
  logger.error({ err }, 'Unhandled error');

  res.status(500).json({
    success: false,
    statusCode: 500,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error',
  });
};
