import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

export interface DatabaseClientOptions {
  databaseUrl?: string;
  max?: number;
}

export type DatabaseInstance = NodePgDatabase<typeof schema>;

export const createDatabase = (
  options?: DatabaseClientOptions,
): DatabaseInstance => {
  if (!options?.databaseUrl) {
    throw new Error('Database URL is required');
  }

  // Create a connection pool with proper configuration
  const pool = new Pool({
    connectionString: options.databaseUrl,
    max: options.max || 10,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // Add error handler to prevent app crashes on connection issues
  pool.on('error', (error) => {
    console.error('Postgres pool error:', error);
  });

  return drizzle(pool, {
    schema,
    casing: 'snake_case',
  });
};
