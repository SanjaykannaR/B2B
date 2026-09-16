import mongoose from 'mongoose';
import env from './env';

const MAX_RETRIES = 3;

export const connectDB = async (): Promise<void> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(env.mongoUri);
      console.log(`[db] MongoDB connected (${env.nodeEnv})`);
      return;
    } catch (err) {
      console.error(
        `[db] Connection attempt ${attempt}/${MAX_RETRIES} failed:`,
        err instanceof Error ? err.message : err,
      );
      if (attempt === MAX_RETRIES) throw err;
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
};

mongoose.connection.on('error', (err) => {
  console.error('[db] Mongo connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[db] Mongo disconnected');
});
