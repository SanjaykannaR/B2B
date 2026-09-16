import type { CorsOptions } from 'cors';
import env from './env';

const allowedOrigins = env.clientUrl ? env.clientUrl.split(',').map((o) => o.trim()) : [];

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Dev is permissive: allow any origin (and no-origin) for local tooling.
    if (env.nodeEnv !== 'production') return callback(null, true);
    // Allow requests with no origin (same-origin, curl, server-to-server).
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
