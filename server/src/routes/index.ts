import { Router } from 'express';
import authRoutes from './auth.routes';
import standardsRoutes from './standards.routes';
import versionsRoutes from './versions.routes';
import pagesRoutes from './pages.routes';

const router: Router = Router();

router.use('/', authRoutes);
router.use('/', standardsRoutes);
router.use('/', versionsRoutes);
router.use('/', pagesRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
