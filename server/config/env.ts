import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/b2b-logistics',
  jwtSecret: (() => {
    if ((process.env.NODE_ENV || 'development') === 'production' && !process.env.JWT_SECRET) {
      throw new Error('[FATAL] JWT_SECRET environment variable is required in production');
    }
    return process.env.JWT_SECRET || 'dev-only-local-secret-do-not-deploy';
  })(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

export const isProd = env.nodeEnv === 'production';

export default env;
