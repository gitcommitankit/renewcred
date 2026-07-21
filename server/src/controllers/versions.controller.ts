import { VersionsService } from '../services/versions.service';
import { ApiResponse } from '../utils/ApiResponse';
import type { Request, Response, NextFunction } from 'express';

export class VersionsController {
  // ── Public endpoints (no auth required) ──────────────────────────

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await VersionsService.getBySlug(req.params.slug as string, req.params.versionSlug as string);
      res.json(ApiResponse.success(version));
    } catch (error) {
      next(error);
    }
  }

  static async getLatest(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await VersionsService.getLatest(req.params.slug as string);
      res.json(ApiResponse.success(version));
    } catch (error) {
      next(error);
    }
  }



  // ── Admin endpoints (authenticate middleware required) ────────────

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await VersionsService.getById(req.params.id as string);
      res.json(ApiResponse.success(version));
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await VersionsService.create(req.params.id as string, req.body);
      res.status(201).json(ApiResponse.created(version));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await VersionsService.update(req.params.id as string, req.body);
      res.json(ApiResponse.success(version, 'Version updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await VersionsService.delete(req.params.id as string);
      res.json(ApiResponse.noContent('Version deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  // ── Admin section endpoints ───────────────────────────────────────

  static async createSection(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await VersionsService.createSection(req.params.versionId as string, req.body);
      res.status(201).json(ApiResponse.created(section));
    } catch (error) {
      next(error);
    }
  }

  static async updateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await VersionsService.updateSection(req.params.id as string, req.body);
      res.json(ApiResponse.success(section, 'Section updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async deleteSection(req: Request, res: Response, next: NextFunction) {
    try {
      await VersionsService.deleteSection(req.params.id as string);
      res.json(ApiResponse.noContent('Section deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async reorderSections(req: Request, res: Response, next: NextFunction) {
    try {
      await VersionsService.reorderSections(req.params.versionId as string, req.body);
      res.json(ApiResponse.success(null, 'Sections reordered successfully'));
    } catch (error) {
      next(error);
    }
  }
}
