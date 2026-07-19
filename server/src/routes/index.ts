import { Router } from 'express';
import authRoutes from './auth.routes.js';
import standardsRoutes from './standards.routes.js';
import versionsRoutes from './versions.routes.js';
import pagesRoutes from './pages.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/standards', standardsRoutes);
router.use('/', versionsRoutes);
router.use('/', pagesRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
