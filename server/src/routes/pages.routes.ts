import { Router } from 'express';
import { PagesController } from '../controllers/pages.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ---- Public routes ----
router.get('/settings', PagesController.getSettings);
router.get('/pages/:slug', PagesController.getBySlug);

// ---- Admin routes ----
router.get('/admin/pages', authenticate, PagesController.getAll);
router.get('/admin/pages/:id', authenticate, PagesController.getById);
router.put('/admin/pages/:id', authenticate, PagesController.update);
router.put('/admin/settings', authenticate, PagesController.updateSettings);

export default router;
