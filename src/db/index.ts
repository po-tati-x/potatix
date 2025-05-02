import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/auth-schema';

// Create a database pool with all the needed options
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // Required for cloud DB providers
  }
});

// Create drizzle instance with the schema
export const db = drizzle(pool, { schema });

// Re-export schema for convenience
export * from './schema/auth-schema'; 