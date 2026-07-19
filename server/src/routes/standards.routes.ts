import { Router } from 'express';
import { StandardsController } from '../controllers/standards.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createStandardSchema, updateStandardSchema } from '../validators/standards.validator.js';

const router = Router();

// ---- Public routes ----
router.get('/', StandardsController.getPublished);
router.get('/:slug', StandardsController.getBySlug);

// ---- Admin routes ----
router.get('/admin/all', authenticate, StandardsController.getAll);
router.get('/admin/:id', authenticate, StandardsController.getById);
router.post('/admin', authenticate, validate(createStandardSchema), StandardsController.create);
router.put('/admin/:id', authenticate, validate(updateStandardSchema), StandardsController.update);
router.delete('/admin/:id', authenticate, StandardsController.delete);

export default router;
