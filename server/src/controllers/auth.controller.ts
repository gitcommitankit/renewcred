import type { Request, Response, NextFunction } from 'express';

import { AuthService } from '@/services/auth.service';
import { ApiResponse } from '@/utils/ApiResponse';
import { env } from '@/config/env';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { admin, accessToken, refreshToken } = await AuthService.login(email, password);
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json(ApiResponse.success({ admin, accessToken }, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        res.status(401).json(ApiResponse.error('No refresh token provided', 401));
        return;
      }

      const { accessToken, refreshToken: newRefreshToken } = await AuthService.refresh(refreshToken);
      
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json(ApiResponse.success({ accessToken }, 'Token refreshed'));
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
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json(ApiResponse.success(null, 'Logged out successfully'));
  }
}
