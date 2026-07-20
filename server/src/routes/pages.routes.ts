import { PagesController } from '@/controllers/pages.controller';
import { authenticate } from '@/middleware/auth';
import { validateUuidParams } from '@/middleware/validate';
import { Router } from 'express';

const router: Router = Router();

// ---- Public routes ----
router.get('/settings', PagesController.getSettings);
router.get('/pages/:slug', PagesController.getBySlug);



// ---- Admin routes ----
router.get('/admin/pages', authenticate, PagesController.getAll);
router.get('/admin/pages/:id', authenticate, validateUuidParams(['id']), PagesController.getById);
router.put('/admin/pages/:id', authenticate, validateUuidParams(['id']), PagesController.update);
router.put('/admin/settings', authenticate, PagesController.updateSettings);

export default router;
