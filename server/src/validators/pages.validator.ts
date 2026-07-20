import { z } from 'zod';

export const updatePageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  isPublished: z.boolean().optional(),
});

export const updateSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required').max(100).optional(),
  tagline: z.string().max(200).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  socialLinks: z.record(z.string(), z.string().url('Invalid URL')).optional().nullable(),
  footerText: z.string().max(500).optional().nullable(),
  newsletterEnabled: z.boolean().optional(),
});

export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
