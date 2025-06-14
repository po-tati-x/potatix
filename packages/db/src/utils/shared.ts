import { timestamp } from "drizzle-orm/pg-core";

/**
 * Standard timestamp fields for all tables
 * Using snake_case for DB columns as per project convention
 */
export const timestamps = {
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull()
};

/**
 * Reusable server-only guard to prevent client-side imports
 * Use this instead of copy-pasting the same check everywhere
 */
export function serverOnly(moduleName: string): void {
  if (typeof globalThis !== "undefined" && 
      Object.prototype.hasOwnProperty.call(globalThis, "window")) {
    throw new Error(`Server-only module "${moduleName}" cannot be imported in browser context`);
  }
}
