import { prisma } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export class PagesService {
  /**
   * Get a published page by slug (public)
   */
  static async getBySlug(slug: string) {
    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page || !page.isPublished) {
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
  static async update(id: string, data: { title?: string; content?: any; isPublished?: boolean }) {
    await this.getById(id);
    return prisma.page.update({ where: { id }, data });
  }

  /**
   * Get site settings
   */
  static async getSettings() {
    let settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });

    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: 'singleton' } });
    }

    return settings;
  }

  /**
   * Update site settings
   */
  static async updateSettings(data: {
    siteName?: string;
    tagline?: string;
    address?: string;
    email?: string;
    phone?: string;
    socialLinks?: any;
    footerText?: string;
    newsletterEnabled?: boolean;
  }) {
    return prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...data },
      update: data,
    });
  }
}
