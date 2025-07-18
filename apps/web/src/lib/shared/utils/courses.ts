/**
 * Utilities for course-related components
 */

/**
 * Format a date string to a human-readable format
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

/**
 * Get color class based on revenue amount
 */
export const getRevenueColorClass = (revenue: number): string => {
  if (revenue === 0) return 'bg-neutral-100 text-neutral-500';
  if (revenue < 1000) return 'bg-blue-100 text-blue-700';
  if (revenue < 3000) return 'bg-emerald-100 text-emerald-700';
  return 'bg-amber-100 text-amber-700';
}; 

/**
 * Converts a string to a URL-friendly slug
 * @param text The string to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normalize to decomposed form for handling accents
    .replaceAll(/[\u0300-\u036F]/g, '') // Remove diacritics/accents
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replaceAll(/\s+/g, '-') // Replace spaces with hyphens
    .replaceAll(/[^^\w-]+/g, '') // Remove all non-word characters except hyphens
    .replaceAll(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
} 