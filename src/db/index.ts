import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Import schemas with explicit naming
import * as authSchema from './schemas/users';
import * as courseSchema from './schemas/course';
// Create a combined schema with explicit sections
const schema = {
  // Auth-related tables managed by Better Auth
  auth: authSchema,
  
  // Application-specific tables managed by the application
  app: courseSchema
};

// Create a database pool with needed options
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

// Create drizzle instance with the combined schema
export const db = drizzle(pool, { schema });

// Re-export schemas for convenience with clear namespacing
export { authSchema };
export { courseSchema }; 