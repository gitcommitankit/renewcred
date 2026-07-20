import { z } from 'zod';

export const createVersionSchema = z.object({
  versionLabel: z.string().min(1, 'Version label is required').max(50),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  status: z.enum(['DRAFT', 'PUBLIC_CONSULTATION', 'CERTIFIED']).default('DRAFT'),
  certifiedAt: z.string().datetime().optional().nullable(),
  consultationStartDate: z.string().datetime().optional().nullable(),
  consultationEndDate: z.string().datetime().optional().nullable(),
  isLatest: z.boolean().default(false),
});

export const updateVersionSchema = createVersionSchema.partial();

export const createSectionSchema = z.object({
  number: z.string().min(1, 'Section number is required'),
  title: z.string().min(1, 'Section title is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  content: z.record(z.unknown()).default({}),
  parentId: z.string().uuid().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const updateSectionSchema = createSectionSchema.partial();

export const reorderSectionsSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int(),
      parentId: z.string().uuid().optional().nullable(),
      number: z.string().optional(),
    })
  ),
});

export type CreateVersionInput = z.infer<typeof createVersionSchema>;
export type UpdateVersionInput = z.infer<typeof updateVersionSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type ReorderSectionsInput = z.infer<typeof reorderSectionsSchema>;
