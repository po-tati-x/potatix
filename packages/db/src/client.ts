import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

export interface DatabaseClientOptions {
  databaseUrl?: string;
  max?: number;
}

export type DatabaseInstance = NodePgDatabase<typeof schema>;

export const createDb = (opts?: DatabaseClientOptions): DatabaseInstance => {
  if (!opts?.databaseUrl) {
    throw new Error("Database URL is required");
  }

  // Create a connection pool with proper configuration
  const pool = new Pool({
    connectionString: opts.databaseUrl,
    max: opts.max || 10,
    ssl: {
      rejectUnauthorized: false // Required for Supabase connections
    }
  });

  // Add error handler to prevent app crashes on connection issues
  pool.on('error', (err) => {
    console.error('Postgres pool error:', err);
  });

  return drizzle(pool, {
    schema,
    casing: "snake_case",
  });
};
