import { PagesService } from '@/services/pages.service';
import { ApiResponse } from '@/utils/ApiResponse';
import type { Request, Response, NextFunction } from 'express';

export class PagesController {
  // ---- Public ----

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await PagesService.getBySlug(req.params.slug as string);
      res.json(ApiResponse.success(page));
    } catch (error) {
      next(error);
    }
  }

  static async getSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await PagesService.getSettings();
      res.json(ApiResponse.success(settings));
    } catch (error) {
      next(error);
    }
  }

  // ---- Admin ----

  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const pages = await PagesService.getAll();
      res.json(ApiResponse.success(pages));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await PagesService.getById(req.params.id as string);
      res.json(ApiResponse.success(page));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await PagesService.update(req.params.id as string, req.body);
      res.json(ApiResponse.success(page, 'Page updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await PagesService.updateSettings(req.body);
      res.json(ApiResponse.success(settings, 'Settings updated successfully'));
    } catch (error) {
      next(error);
    }
  }
}
