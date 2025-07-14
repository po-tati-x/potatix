export * from 'drizzle-orm/sql';
export { alias } from 'drizzle-orm/pg-core';

export * from './schema';
export * from './client';

// Typed models & helpers
export * from './types';

// Singleton DB instance
import { createDatabase, type DatabaseInstance } from './client';
import { databaseEnvironment } from './env.server';

let _databaseInstance: DatabaseInstance | undefined;

/**
 * Get or create a singleton database instance.
 * Ensures we reuse the same connection pool across the application.
 */
export function getDatabase(databaseUrl: string = databaseEnvironment.DATABASE_URL): DatabaseInstance {
  if (!_databaseInstance) {
    _databaseInstance = createDatabase({
      databaseUrl,
      max: 10,
    });
  }

  return _databaseInstance;
}

// Singleton instance exported for optional direct import
export const database = getDatabase();
