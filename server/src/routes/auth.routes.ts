import { AuthController } from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth';
import { authLimiter } from '@/middleware/rateLimiter';
import { validate } from '@/middleware/validate';
import { loginSchema } from '@/validators/auth.validator';
import { Router } from 'express';

const router: Router = Router();

router.post('/auth/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/auth/refresh', AuthController.refresh);
router.post('/auth/logout', authenticate, AuthController.logout);
router.get('/auth/me', authenticate, AuthController.me);

export default router;
