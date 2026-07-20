import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';

type ValidateTarget = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, target: ValidateTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[target]);
      req[target] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Validation failed',
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
};

export const validateUuidParams = (paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    for (const paramName of paramNames) {
      const val = req.params[paramName];
      if (val) {
        const valStr = Array.isArray(val) ? val[0] : val;
        if (!uuidRegex.test(valStr)) {
          res.status(400).json({
            success: false,
            statusCode: 400,
            message: 'Validation failed',
            errors: [{ field: paramName, message: 'Must be a valid UUID' }],
          });
          return;
        }
      }
    }
    
    next();
  };
};
