import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app: express.Application = express();

// Trust reverse proxies (Nginx, Render, Railway, Vercel)
app.set('trust proxy', 1);

// Security & CORS
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing & Cookie parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Request logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting
app.use('/api/', apiLimiter);

// CSRF Origin Guard for production cross-origin cookies
if (env.NODE_ENV === 'production') {
  const allowedOrigins = new Set(env.CORS_ORIGIN.split(',').map((o) => o.trim()));
  app.use((req, res, next) => {
    const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
    if (!MUTATING_METHODS.has(req.method)) return next();

    const origin = req.headers.origin;
    if (!origin || !allowedOrigins.has(origin)) {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Forbidden: invalid request origin',
      });
      return;
    }
    next();
  });
}

// Health check routes
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Hello from RenewCred CMS server',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
