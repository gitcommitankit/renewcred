import { PagesController } from '@/controllers/pages.controller';
import { authenticate } from '@/middleware/auth';
import { validate, validateUuidParams } from '@/middleware/validate';
import { updatePageSchema, updateSettingsSchema } from '@/validators/pages.validator';
import { Router } from 'express';

const router: Router = Router();

// ---- Public routes ----
router.get('/settings', PagesController.getSettings);
router.get('/pages/:slug', PagesController.getBySlug);



// ---- Admin routes ----
router.get('/admin/pages', authenticate, PagesController.getAll);
router.get('/admin/pages/:id', authenticate, validateUuidParams(['id']), PagesController.getById);
router.put('/admin/pages/:id', authenticate, validateUuidParams(['id']), validate(updatePageSchema), PagesController.update);
router.put('/admin/settings', authenticate, validate(updateSettingsSchema), PagesController.updateSettings);

export default router;
