import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(ApiResponse.success(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);
      res.json(ApiResponse.success(result, 'Token refreshed'));
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await AuthService.getMe(req.admin!.adminId);
      res.json(ApiResponse.success(admin));
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response) {
    // With JWT, logout is handled client-side by removing the token.
    // In a production app with a token blacklist, we'd invalidate here.
    res.json(ApiResponse.success(null, 'Logged out successfully'));
  }
}
