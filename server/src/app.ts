import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    message: 'Hello! Renewcred CMS API is running 🚀',
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { app };
