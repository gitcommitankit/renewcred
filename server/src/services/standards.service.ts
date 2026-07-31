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
   * Re-indexes standards list sequentially (0, 1, 2, 3...) in parallel
   */
  private static async reindex(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    list: Array<{ id: string; sortOrder: number }>
  ) {
    const updates = list.flatMap((item, index) => {
      if (item.sortOrder !== index) {
        return [tx.standard.update({ where: { id: item.id }, data: { sortOrder: index } })];
      }
      return [];
    });

    if (updates.length > 0) {
      await Promise.all(updates);
    }
  }

  /**
   * Create a new standard (admin)
   */
  static async create(data: CreateStandardInput) {
    const existingSlug = await prisma.standard.findUnique({ where: { slug: data.slug } });
    if (existingSlug) {
      throw ApiError.conflict('A standard with this slug already exists');
    }

    return prisma.$transaction(async (tx) => {
      const created = await tx.standard.create({ data });

      const list = await tx.standard.findMany({
        where: { id: { not: created.id } },
        orderBy: { sortOrder: 'asc' },
      });

      const targetIndex = Math.min(Math.max(0, data.sortOrder ?? list.length), list.length);
      list.splice(targetIndex, 0, created);

      await StandardsService.reindex(tx, list);
      return { ...created, sortOrder: targetIndex };
    });
  }

  /**
   * Update an existing standard (admin)
   */
  static async update(id: string, data: UpdateStandardInput) {
    const existing = await prisma.standard.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Standard not found');
    }

    if (data.slug && data.slug !== existing.slug) {
      const duplicateSlug = await prisma.standard.findUnique({ where: { slug: data.slug } });
      if (duplicateSlug) {
        throw ApiError.conflict('A standard with this slug already exists');
      }
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.standard.update({ where: { id }, data });

      if (data.sortOrder !== undefined) {
        const list = await tx.standard.findMany({
          where: { id: { not: id } },
          orderBy: { sortOrder: 'asc' },
        });

        const targetIndex = Math.min(Math.max(0, data.sortOrder), list.length);
        list.splice(targetIndex, 0, updated);

        await StandardsService.reindex(tx, list);
        return { ...updated, sortOrder: targetIndex };
      }

      return updated;
    });
  }

  /**
   * Delete a standard and all its versions/sections (admin)
   */
  static async delete(id: string) {
    const existing = await prisma.standard.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Standard not found');
    }

    return prisma.$transaction(async (tx) => {
      const deleted = await tx.standard.delete({ where: { id } });

      const remaining = await tx.standard.findMany({
        orderBy: { sortOrder: 'asc' },
      });

      await StandardsService.reindex(tx, remaining);
      return deleted;
    });
  }
}
