import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { CreateStandardInput, UpdateStandardInput } from '../validators/standards.validator';

export class StandardsService {
  /**
   * Get all published standards (public)
   */
  static async getPublished() {
    return prisma.standard.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        icon: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { versions: true } },
      },
    });
  }

  /**
   * Get all standards including drafts (admin)
   */
  static async getAll() {
    return prisma.standard.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { versions: true } },
      },
    });
  }

  /**
   * Get a single standard by slug with its non-draft versions (public)
   */
  static async getBySlug(slug: string) {
    const standard = await prisma.standard.findUnique({
      where: { slug, isPublished: true },
      include: {
        versions: {
          where: { status: { not: 'DRAFT' } },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            versionLabel: true,
            slug: true,
            status: true,
            certifiedAt: true,
            consultationStartDate: true,
            consultationEndDate: true,
            isLatest: true,
            createdAt: true,
          },
        },
      },
    });

    if (!standard) {
      throw ApiError.notFound('Standard not found');
    }

    return standard;
  }

  /**
   * Get a single standard by ID (admin)
   */
  static async getById(id: string) {
    const standard = await prisma.standard.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            versionLabel: true,
            slug: true,
            status: true,
            certifiedAt: true,
            consultationStartDate: true,
            consultationEndDate: true,
            isLatest: true,
            createdAt: true,
          },
        },
      },
    });

    if (!standard) {
      throw ApiError.notFound('Standard not found');
    }

    return standard;
  }

  /**
   * Create a new standard (admin)
   */
  static async create(data: CreateStandardInput) {
    return prisma.standard.create({ data });
  }

  /**
   * Update an existing standard (admin)
   */
  static async update(id: string, data: UpdateStandardInput) {
    return prisma.standard.update({ where: { id }, data });
  }

  /**
   * Delete a standard and all its versions/sections (admin)
   */
  static async delete(id: string) {
    return prisma.standard.delete({ where: { id } });
  }
}
