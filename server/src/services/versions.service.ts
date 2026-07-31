import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import {
  CreateSectionInput,
  CreateVersionInput,
  ReorderSectionsInput,
  UpdateSectionInput,
  UpdateVersionInput,
} from '../validators/versions.validator';

export class VersionsService {
  // Versions

  /**
   * Get all published/public version summaries for a standard (public)
   */
  static async getVersions(standardSlug: string) {
    return prisma.version.findMany({
      where: {
        status: { not: 'DRAFT' },
        standard: { slug: standardSlug, isPublished: true },
      },
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
    });
  }

  /**
   * Get a specific version with all sections (public)
   */
  static async getBySlug(standardSlug: string, versionSlug: string) {
    const version = await prisma.version.findFirst({
      where: {
        slug: versionSlug,
        status: { not: 'DRAFT' },
        standard: { slug: standardSlug, isPublished: true },
      },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!version) {
      throw ApiError.notFound('Version not found');
    }

    return version;
  }

  /**
   * Get the latest version for a standard (public)
   */
  static async getLatest(standardSlug: string) {
    const version = await prisma.version.findFirst({
      where: {
        status: { not: 'DRAFT' },
        standard: { slug: standardSlug, isPublished: true },
      },
      orderBy: [{ isLatest: 'desc' }, { createdAt: 'desc' }],
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!version) {
      const standardExists = await prisma.standard.findFirst({
        where: { slug: standardSlug, isPublished: true },
        select: { id: true },
      });
      if (!standardExists) {
        throw ApiError.notFound('Standard not found');
      }
      throw ApiError.notFound('No published versions found');
    }

    return version;
  }

  /**
   * Create a new version (admin)
   */
  static async create(standardId: string, data: CreateVersionInput) {
    const existing = await prisma.version.findFirst({
      where: {
        standardId,
        OR: [{ versionLabel: data.versionLabel }, { slug: data.slug }],
      },
    });

    if (existing) {
      if (existing.versionLabel === data.versionLabel) {
        throw ApiError.conflict('A version with this label already exists for this standard');
      }
      throw ApiError.conflict('A version with this slug already exists for this standard');
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // If this version is marked as latest, unmark only the previous latest
      if (data.isLatest) {
        await tx.version.updateMany({
          where: { standardId, isLatest: true },
          data: { isLatest: false },
        });
      }

      return tx.version.create({
        data: {
          ...data,
          standardId,
          certifiedAt: data.certifiedAt ? new Date(data.certifiedAt) : null,
          consultationStartDate: data.consultationStartDate
            ? new Date(data.consultationStartDate)
            : null,
          consultationEndDate: data.consultationEndDate ? new Date(data.consultationEndDate) : null,
        },
      });
    });
  }

  /**
   * Update a version (admin)
   */
  static async update(id: string, data: UpdateVersionInput) {
    const version = await prisma.version.findUnique({ where: { id } });

    if (!version) {
      throw ApiError.notFound('Version not found');
    }

    if (data.slug || data.versionLabel) {
      const duplicate = await prisma.version.findFirst({
        where: {
          standardId: version.standardId,
          id: { not: id },
          OR: [
            ...(data.versionLabel ? [{ versionLabel: data.versionLabel }] : []),
            ...(data.slug ? [{ slug: data.slug }] : []),
          ],
        },
      });
      if (duplicate) {
        if (data.versionLabel && duplicate.versionLabel === data.versionLabel) {
          throw ApiError.conflict('A version with this label already exists for this standard');
        }
        throw ApiError.conflict('A version with this slug already exists for this standard');
      }
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // If marking as latest, unmark others
      if (data.isLatest) {
        await tx.version.updateMany({
          where: { standardId: version.standardId, id: { not: id } },
          data: { isLatest: false },
        });
      }

      return tx.version.update({
        where: { id },
        data: {
          ...data,
          certifiedAt:
            data.certifiedAt !== undefined
              ? data.certifiedAt
                ? new Date(data.certifiedAt)
                : null
              : undefined,
          consultationStartDate:
            data.consultationStartDate !== undefined
              ? data.consultationStartDate
                ? new Date(data.consultationStartDate)
                : null
              : undefined,
          consultationEndDate:
            data.consultationEndDate !== undefined
              ? data.consultationEndDate
                ? new Date(data.consultationEndDate)
                : null
              : undefined,
        },
      });
    });
  }

  /**
   * Delete a version (admin)
   */
  static async delete(id: string) {
    return prisma.version.delete({ where: { id } });
  }

  /**
   * Get a version by ID with sections (admin)
   */
  static async getById(id: string) {
    const version = await prisma.version.findUnique({
      where: { id },
      include: {
        standard: {
          select: { id: true, title: true, slug: true },
        },
        sections: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!version) {
      throw ApiError.notFound('Version not found');
    }

    return version;
  }

  // Sections

  /**
   * Create a section (admin)
   */
  static async createSection(versionId: string, data: CreateSectionInput) {
    return prisma.section.create({
      data: {
        ...data,
        content: data.content as object,
        versionId,
      },
    });
  }

  /**
   * Update a section (admin)
   */
  static async updateSection(id: string, data: UpdateSectionInput) {
    return prisma.section.update({
      where: { id },
      data: {
        ...data,
        content: data.content as object,
      },
    });
  }

  /**
   * Delete a section (admin)
   */
  static async deleteSection(id: string) {
    return prisma.section.delete({ where: { id } });
  }

  /**
   * Reorder sections (admin)
   */
  static async reorderSections(versionId: string, data: ReorderSectionsInput) {
    const operations = data.sections.map((s) =>
      prisma.section.update({
        where: { id: s.id },
        data: {
          sortOrder: s.sortOrder,
          parentId: s.parentId ?? null,
          ...(s.number !== undefined ? { number: s.number } : {}),
        },
      })
    );

    return prisma.$transaction(operations);
  }
}
