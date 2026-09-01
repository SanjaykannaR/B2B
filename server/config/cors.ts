// This file is for: CORS origin whitelist configuration
// Module: Backend Configuration (Module 1)
// Owner: Developer 1 (Backend Engineer)

import cors from 'cors';
import env from './env';

const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'];

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    // Allow same-origin / non-browser requests (no origin header)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In development, allow any origin to prevent CORS errors during local testing
    if (env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const corsMiddleware = cors(corsOptions);
export default corsMiddleware;
