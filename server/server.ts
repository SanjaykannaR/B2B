// This file is for: Express app entry point — server.ts
// Module: Backend Configuration & Server Setup (Module 1)
// Owner: Developer 1 (Backend Engineer)

import express, { Request, Response, NextFunction } from 'express';
import env from './config/env';
import connectDB from './config/db';
import corsMiddleware from './config/cors';
import { runSeeds } from './seeds/seed';
import User from './models/User';
import errorHandler from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import vehicleRoutes from './routes/vehicle.routes';
import manifestRoutes from './routes/manifest.routes';
import invoiceRoutes from './routes/invoice.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationRoutes from './routes/notification.routes';

import { startOverdueSweep } from './cron/overdueSweep';

const app = express();

// ── Global middleware ──
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Request logger (dev) ──
if (env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── API routes ──
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/manifests', manifestRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Health check ──
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'B2B Logistics API is running', uptime: process.uptime() });
});

// ── 404 for unknown API routes ──
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ──
app.use(errorHandler);

// ── Boot ──
async function start(): Promise<void> {
  try {
    await connectDB();
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📦 Database is empty. Seeding initial data...');
      await runSeeds();
    }
    startOverdueSweep();
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`   Health check: http://localhost:${env.PORT}/api/health`);
      console.log(`   Environment: ${env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', (err as Error).message);
    process.exit(1);
  }
}

start();

export default app;
