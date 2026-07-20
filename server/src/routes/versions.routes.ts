import { Router } from 'express';
import {
  createVersionSchema,
  updateVersionSchema,
  createSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
} from '@/validators/versions.validator';
import { VersionsController } from '@/controllers/versions.controller';
import { validate, validateUuidParams } from '@/middleware/validate';
import { authenticate } from '@/middleware/auth';

const router: Router = Router();

// ---- Public routes ----
router.get('/standards/:slug/versions', VersionsController.getByStandardSlug);
router.get('/standards/:slug/versions/latest', VersionsController.getLatest);
router.get('/standards/:slug/versions/:versionSlug', VersionsController.getBySlug);
router.get('/versions/:versionId/sections', validateUuidParams(['versionId']), VersionsController.getSections);

// ---- Admin routes ----
router.get('/admin/versions/:id', authenticate, validateUuidParams(['id']), VersionsController.getById);
router.post(
  '/admin/standards/:id/versions',
  authenticate,
  validateUuidParams(['id']),
  validate(createVersionSchema),
  VersionsController.create
);
router.put(
  '/admin/versions/:id',
  authenticate,
  validateUuidParams(['id']),
  validate(updateVersionSchema),
  VersionsController.update
);
router.delete('/admin/versions/:id', authenticate, validateUuidParams(['id']), VersionsController.delete);

// ---- Admin Section routes ----
router.post(
  '/admin/versions/:versionId/sections',
  authenticate,
  validateUuidParams(['versionId']),
  validate(createSectionSchema),
  VersionsController.createSection
);
router.put(
  '/admin/sections/:id',
  authenticate,
  validateUuidParams(['id']),
  validate(updateSectionSchema),
  VersionsController.updateSection
);
router.delete('/admin/sections/:id', authenticate, validateUuidParams(['id']), VersionsController.deleteSection);
router.put(
  '/admin/versions/:versionId/sections/reorder',
  authenticate,
  validateUuidParams(['versionId']),
  validate(reorderSectionsSchema),
  VersionsController.reorderSections
);

export default router;
