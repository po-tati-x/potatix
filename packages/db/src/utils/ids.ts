/**
 * Generate a unique ID string suitable for database primary keys
 * Using nanoid for cryptographically strong, URL-friendly unique strings
 */
export function createId(): string {
  // Generate a random string of 12 characters
  // This length provides a good balance between uniqueness and brevity
  return Array.from(
    { length: 12 },
    () =>
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[
        Math.floor(Math.random() * 62)
      ],
  ).join('');
}
