import { prisma } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import type {
  CreateVersionInput,
  UpdateVersionInput,
  CreateSectionInput,
  UpdateSectionInput,
  ReorderSectionsInput,
} from '../validators/versions.validator.js';

export class VersionsService {
  
  // Versions
  
  /**
   * Get all non-draft versions for a standard (public)
   */
  static async getByStandardSlug(standardSlug: string) {
    const standard = await prisma.standard.findUnique({
      where: { slug: standardSlug, isPublished: true },
    });

    if (!standard) {
      throw ApiError.notFound('Standard not found');
    }

    return prisma.version.findMany({
      where: { standardId: standard.id, status: { not: 'DRAFT' } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a specific version with all sections (public)
   */
  static async getBySlug(standardSlug: string, versionSlug: string) {
    const standard = await prisma.standard.findUnique({
      where: { slug: standardSlug, isPublished: true },
    });

    if (!standard) {
      throw ApiError.notFound('Standard not found');
    }

    const version = await prisma.version.findUnique({
      where: {
        standardId_slug: { standardId: standard.id, slug: versionSlug },
      },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!version || version.status === 'DRAFT') {
      throw ApiError.notFound('Version not found');
    }

    return version;
  }

  /**
   * Get the latest version for a standard (public)
   */
  static async getLatest(standardSlug: string) {
    const standard = await prisma.standard.findUnique({
      where: { slug: standardSlug, isPublished: true },
    });

    if (!standard) {
      throw ApiError.notFound('Standard not found');
    }

    const version = await prisma.version.findFirst({
      where: { standardId: standard.id, isLatest: true },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!version) {
      // Fallback to most recent non-draft version
      const fallback = await prisma.version.findFirst({
        where: { standardId: standard.id, status: { not: 'DRAFT' } },
        orderBy: { createdAt: 'desc' },
        include: {
          sections: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      if (!fallback) {
        throw ApiError.notFound('No published versions found');
      }

      return fallback;
    }

    return version;
  }

  /**
   * Create a new version (admin)
   */
  static async create(standardId: string, data: CreateVersionInput) {
    // If this version is marked as latest, unmark all others
    if (data.isLatest) {
      await prisma.version.updateMany({
        where: { standardId },
        data: { isLatest: false },
      });
    }

    return prisma.version.create({
      data: {
        ...data,
        standardId,
        certifiedAt: data.certifiedAt ? new Date(data.certifiedAt) : null,
        consultationStartDate: data.consultationStartDate ? new Date(data.consultationStartDate) : null,
        consultationEndDate: data.consultationEndDate ? new Date(data.consultationEndDate) : null,
      },
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

    // If marking as latest, unmark others
    if (data.isLatest) {
      await prisma.version.updateMany({
        where: { standardId: version.standardId, id: { not: id } },
        data: { isLatest: false },
      });
    }

    return prisma.version.update({
      where: { id },
      data: {
        ...data,
        certifiedAt: data.certifiedAt !== undefined
          ? (data.certifiedAt ? new Date(data.certifiedAt) : null)
          : undefined,
        consultationStartDate: data.consultationStartDate !== undefined
          ? (data.consultationStartDate ? new Date(data.consultationStartDate) : null)
          : undefined,
        consultationEndDate: data.consultationEndDate !== undefined
          ? (data.consultationEndDate ? new Date(data.consultationEndDate) : null)
          : undefined,
      },
    });
  }

  /**
   * Delete a version (admin)
   */
  static async delete(id: string) {
    const version = await prisma.version.findUnique({ where: { id } });

    if (!version) {
      throw ApiError.notFound('Version not found');
    }

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
      },
    });

    if (!version) {
      throw ApiError.notFound('Version not found');
    }

    return version;
  }

  
  // Sections
  

  /**
   * Get sections tree for a version (public)
   */
  static async getSections(versionId: string) {
    return prisma.section.findMany({
      where: { versionId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Create a section (admin)
   */
  static async createSection(versionId: string, data: CreateSectionInput) {
    // Verify version exists
    const version = await prisma.version.findUnique({ where: { id: versionId } });
    if (!version) {
      throw ApiError.notFound('Version not found');
    }

    return prisma.section.create({
      data: {
        ...data,
        versionId,
      },
    });
  }

  /**
   * Update a section (admin)
   */
  static async updateSection(id: string, data: UpdateSectionInput) {
    const section = await prisma.section.findUnique({ where: { id } });
    if (!section) {
      throw ApiError.notFound('Section not found');
    }

    return prisma.section.update({ where: { id }, data });
  }

  /**
   * Delete a section (admin)
   */
  static async deleteSection(id: string) {
    const section = await prisma.section.findUnique({ where: { id } });
    if (!section) {
      throw ApiError.notFound('Section not found');
    }

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
