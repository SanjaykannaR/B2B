// This file is for: MongoDB connection with retry logic
// Module: Backend Configuration (Module 1)
// Owner: Developer 1 (Backend Engineer)

import mongoose from 'mongoose';
import dns from 'dns';
import env from './env';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;

function overrideDnsServers(): void {
  const dnsServers = (process.env.DNS_SERVERS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (dnsServers.length === 0) return;
  try {
    dns.setServers(dnsServers);
    console.log(`DNS servers overridden: ${dnsServers.join(', ')}`);
  } catch (err) {
    console.warn(`Could not override DNS servers (${dnsServers.join(', ')}):`, (err as Error).message);
  }
}

export async function connectDB(): Promise<void> {
  overrideDnsServers();
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
      });
      console.log(`✅ MongoDB connected (attempt ${attempt})`);
      return;
    } catch (err) {
      const error = err as Error;
      console.warn(`❌ MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed:`, error.message);
      
      if (attempt === MAX_ATTEMPTS) {
        console.log(`⚠️ Local MongoDB is not running. Starting an in-memory database as a fallback...`);
        try {
          const { MongoMemoryServer } = require('mongodb-memory-server');
          const mongoServer = await MongoMemoryServer.create();
          const uri = mongoServer.getUri();
          await mongoose.connect(uri);
          console.log(`✅ MongoDB Memory Server connected successfully!`);
          return;
        } catch (memErr) {
          console.error(`❌ Failed to start in-memory database:`, (memErr as Error).message);
          throw new Error('All MongoDB connection attempts failed');
        }
      } else {
        console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

}

export default connectDB;
