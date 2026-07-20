import { ApiError } from '@/utils/ApiError';
import { logger } from '@/utils/logger';
import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

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
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      res.status(409).json({
        success: false,
        statusCode: 409,
        message: `A record with this ${target} already exists`,
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Record not found',
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
