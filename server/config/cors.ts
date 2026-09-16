import type { CorsOptions } from 'cors';
import env from './env';

const allowedOrigins = env.clientUrl ? env.clientUrl.split(',').map((o) => o.trim()) : [];

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (same-origin, curl, server-to-server) only in dev
    if (!origin) {
      if (env.nodeEnv === 'development') return callback(null, true);
      return callback(new Error('CORS: No origin header'));
    }
    if (allowedOrigins.length === 0 && env.nodeEnv === 'development') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
