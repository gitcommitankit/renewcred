import { Router } from 'express';
import { VersionsController } from '../controllers/versions.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createVersionSchema,
  updateVersionSchema,
  createSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
} from '../validators/versions.validator.js';

const router = Router();

// ---- Public routes ----
router.get('/standards/:slug/versions', VersionsController.getByStandardSlug);
router.get('/standards/:slug/versions/latest', VersionsController.getLatest);
router.get('/standards/:slug/versions/:versionSlug', VersionsController.getBySlug);
router.get('/versions/:versionId/sections', VersionsController.getSections);

// ---- Admin routes ----
router.get('/admin/versions/:id', authenticate, VersionsController.getById);
router.post(
  '/admin/standards/:id/versions',
  authenticate,
  validate(createVersionSchema),
  VersionsController.create
);
router.put(
  '/admin/versions/:id',
  authenticate,
  validate(updateVersionSchema),
  VersionsController.update
);
router.delete('/admin/versions/:id', authenticate, VersionsController.delete);

// ---- Admin Section routes ----
router.post(
  '/admin/versions/:versionId/sections',
  authenticate,
  validate(createSectionSchema),
  VersionsController.createSection
);
router.put(
  '/admin/sections/:id',
  authenticate,
  validate(updateSectionSchema),
  VersionsController.updateSection
);
router.delete('/admin/sections/:id', authenticate, VersionsController.deleteSection);
router.put(
  '/admin/versions/:versionId/sections/reorder',
  authenticate,
  validate(reorderSectionsSchema),
  VersionsController.reorderSections
);

export default router;
