import prisma from '../config/database';
import { env } from '../config/env';
import { AuthPayload } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  static async login(email: string, password: string) {
    const admin = await prisma.admin.findUnique({ where: { email } });
    const DUMMY_HASH = '$2a$10$e8p.KxJ7WjE2QdM4KkL6s.o5f1A4t3M2N1O0P9Q8R7S6T5U4V3W2X';
    const isPasswordValid = await bcrypt.compare(password, admin ? admin.passwordHash : DUMMY_HASH);

    if (!admin || !isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const payload: AuthPayload = { adminId: admin.id, email: admin.email };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    return {
      accessToken,
      refreshToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  }

  static async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as AuthPayload;

      const admin = await prisma.admin.findUnique({ where: { id: decoded.adminId } });

      if (!admin) {
        throw ApiError.unauthorized('Admin not found');
      }

      const payload: AuthPayload = { adminId: admin.id, email: admin.email };

      const newAccessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      });

      const newRefreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }

  static async getMe(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!admin) {
      throw ApiError.notFound('Admin not found');
    }

    return admin;
  }
}
