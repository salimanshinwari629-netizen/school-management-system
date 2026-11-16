import mongoose from 'mongoose';

import { logger } from './logger';

const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
} as const;

export async function connectToDatabase(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  logger.info({ database: mongoose.connection.name }, 'MongoDB connected');
}

export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

export function databaseState(): string {
  return CONNECTION_STATES[mongoose.connection.readyState as keyof typeof CONNECTION_STATES];
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}
