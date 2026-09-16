import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db';
import env, { isProd } from './config/env';
import { corsOptions } from './config/cors';
import { startOverdueSweep } from './cron/overdueSweep';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import vehicleRoutes from './routes/vehicle.routes';
import manifestRoutes from './routes/manifest.routes';
import invoiceRoutes from './routes/invoice.routes';
import notificationRoutes from './routes/notification.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

// ── Security headers ────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── Core middleware ───────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json({ limit: isProd ? '100kb' : '5mb' }));
app.use(express.urlencoded({ extended: true, limit: isProd ? '100kb' : '5mb' }));

// Hide server fingerprint
app.disable('x-powered-by');

// ── Health check ──────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'OK', data: { status: 'up' } });
});

// ── API routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/manifests', manifestRoutes);
// app.use('/api/delivery-requests', deliveryRequestRouter); // commented out — teammate owns driver pages
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── Central error handler (must be last) ──────────────────────────
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    app.listen(env.port, () => {
      console.log(`[server] API listening on http://localhost:${env.port} (${env.nodeEnv})`);
    });
    startOverdueSweep();
  } catch (err) {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  }
};

start();
