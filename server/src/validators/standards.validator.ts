import { z } from 'zod';

export const createStandardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(false),
});

export const updateStandardSchema = createStandardSchema.partial();

export type CreateStandardInput = z.infer<typeof createStandardSchema>;
export type UpdateStandardInput = z.infer<typeof updateStandardSchema>;
