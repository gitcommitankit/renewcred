import { StandardsController } from '@/controllers/standards.controller';
import { authenticate } from '@/middleware/auth';
import { validate, validateUuidParams } from '@/middleware/validate';
import { createStandardSchema, updateStandardSchema } from '@/validators/standards.validator';
import { Router } from 'express';

const router: Router = Router();

// ---- Public routes ----
router.get('/standards', StandardsController.getPublished);
router.get('/standards/:slug', StandardsController.getBySlug);

// ---- Admin routes ----
router.get('/admin/standards', authenticate, StandardsController.getAll);
router.get('/admin/standards/:id', authenticate, validateUuidParams(['id']), StandardsController.getById);
router.post('/admin/standards', authenticate, validate(createStandardSchema), StandardsController.create);
router.put('/admin/standards/:id', authenticate, validateUuidParams(['id']), validate(updateStandardSchema), StandardsController.update);
router.delete('/admin/standards/:id', authenticate, validateUuidParams(['id']), StandardsController.delete);

export default router;
