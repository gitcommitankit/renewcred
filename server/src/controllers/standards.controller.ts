import { StandardsService } from '../services/standards.service';
import { ApiResponse } from '../utils/ApiResponse';
import type { Request, Response, NextFunction } from 'express';

export class StandardsController {
  // ---- Public ----

  static async getPublished(_req: Request, res: Response, next: NextFunction) {
    try {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      const standards = await StandardsService.getPublished();
      res.json(ApiResponse.success(standards));
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      const standard = await StandardsService.getBySlug(req.params.slug as string);
      res.json(ApiResponse.success(standard));
    } catch (error) {
      next(error);
    }
  }

  // ---- Admin ----

  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const standards = await StandardsService.getAll();
      res.json(ApiResponse.success(standards));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const standard = await StandardsService.getById(req.params.id as string);
      res.json(ApiResponse.success(standard));
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const standard = await StandardsService.create(req.body);
      res.status(201).json(ApiResponse.created(standard));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const standard = await StandardsService.update(req.params.id as string, req.body);
      res.json(ApiResponse.success(standard, 'Standard updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await StandardsService.delete(req.params.id as string);
      res.json(ApiResponse.noContent('Standard deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}
