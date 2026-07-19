import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma } from './config/database.js';

const start = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    app.listen(env.SERVER_PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${env.SERVER_PORT}`);
      logger.info(`📝 API docs at http://localhost:${env.SERVER_PORT}/api/v1/health`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error({ error }, '❌ Failed to start server');
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
