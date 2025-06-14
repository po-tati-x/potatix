export * from "drizzle-orm/sql";
export { alias } from "drizzle-orm/pg-core";

export * from "./schema";
export * from "./client";

import * as authSchemaImport from "./schemas/better-auth";
import * as courseSchemaImport from "./schemas/course";
import * as profileSchemaImport from "./schemas/user-profile";

// Export schema modules
export const authSchema = authSchemaImport;
export const courseSchema = courseSchemaImport;
export const profileSchema = profileSchemaImport;

// Singleton DB instance
import { createDb, type DatabaseInstance } from "./client";

let _db: DatabaseInstance | null = null;

/**
 * Get or create a singleton database instance
 * This ensures we reuse the same connection pool across the application
 */
export function getDb(databaseUrl?: string): DatabaseInstance {
  if (!_db) {
    if (!databaseUrl && process.env.DATABASE_URL) {
      databaseUrl = process.env.DATABASE_URL;
    }
    
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required either in env or as a parameter");
    }
    
    _db = createDb({
      databaseUrl,
      max: 10,
    });
  }
  
  return _db;
}

// Export singleton instance as 'db' for convenience
export const db = typeof process !== "undefined" && process.env.DATABASE_URL 
  ? getDb(process.env.DATABASE_URL)
  : null;
