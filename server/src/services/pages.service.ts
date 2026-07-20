import prisma from '@/config/database';
import { ApiError } from '@/utils/ApiError';
import { Prisma } from '@prisma/client';
import type { UpdatePageInput, UpdateSettingsInput } from '@/validators/pages.validator';

export class PagesService {
  /**
   * Get a published page by slug (public)
   */
  static async getBySlug(slug: string) {
    const page = await prisma.page.findFirst({
      where: { slug, isPublished: true },
    });

    if (!page) {
      throw ApiError.notFound('Page not found');
    }

    return page;
  }

  /**
   * Get all pages (admin)
   */
  static async getAll() {
    return prisma.page.findMany({
      orderBy: { title: 'asc' },
    });
  }

  /**
   * Get a page by ID (admin)
   */
  static async getById(id: string) {
    const page = await prisma.page.findUnique({ where: { id } });

    if (!page) {
      throw ApiError.notFound('Page not found');
    }

    return page;
  }

  /**
   * Update a page (admin)
   */
  static async update(id: string, data: UpdatePageInput) {
    return prisma.page.update({ 
      where: { id }, 
      data: {
        ...data,
        content: data.content as Prisma.InputJsonValue | undefined,
      }
    });
  }

  /**
   * Seed site settings on server startup if not present
   */
  static async initSettings() {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
    if (!settings) {
      await prisma.siteSettings.create({ data: { id: 'singleton' } });
    }
  }

  /**
   * Get site settings (public/admin)
   */
  static async getSettings() {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });

    if (!settings) {
      return {
        id: 'singleton',
        siteName: 'RenewCred',
        tagline: null,
        address: null,
        email: null,
        phone: null,
        socialLinks: null,
        footerText: null,
        newsletterEnabled: true,
        updatedAt: new Date(),
      };
    }

    return settings;
  }

  /**
   * Update site settings
   */
  static async updateSettings(data: UpdateSettingsInput) {
    const prismaData = {
      ...data,
      socialLinks: data.socialLinks === null ? Prisma.DbNull : data.socialLinks as Prisma.InputJsonValue | undefined,
    };

    return prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...prismaData },
      update: prismaData,
    });
  }
}
