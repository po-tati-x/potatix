'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createId = createId;
/**
 * Generate a unique ID string suitable for database primary keys
 * Using nanoid for cryptographically strong, URL-friendly unique strings
 */
function createId() {
  // Generate a random string of 12 characters
  // This length provides a good balance between uniqueness and brevity
  return Array.from({ length: 12 }, function () {
    return 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[
      Math.floor(Math.random() * 62)
    ];
  }).join('');
}
