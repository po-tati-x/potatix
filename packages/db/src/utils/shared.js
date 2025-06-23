'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.timestamps = void 0;
exports.serverOnly = serverOnly;
var pg_core_1 = require('drizzle-orm/pg-core');
/**
 * Standard timestamp fields for all tables
 * Using snake_case for DB columns as per project convention
 */
exports.timestamps = {
  createdAt: (0, pg_core_1.timestamp)('created_at', { mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: (0, pg_core_1.timestamp)('updated_at', { mode: 'date' })
    .defaultNow()
    .notNull(),
};
/**
 * Reusable server-only guard to prevent client-side imports
 * Use this instead of copy-pasting the same check everywhere
 */
function serverOnly(moduleName) {
  if (
    typeof globalThis !== 'undefined' &&
    Object.prototype.hasOwnProperty.call(globalThis, 'window')
  ) {
    throw new Error(
      'Server-only module "'.concat(
        moduleName,
        '" cannot be imported in browser context',
      ),
    );
  }
}
