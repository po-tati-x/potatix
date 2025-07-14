import { object, string, optional, parse } from 'valibot';

/**
 * Auth package server-side environment schema.
 * Evaluated exclusively in a Node context, therefore direct `process.env` access
 * is permitted here – but only after validation through valibot.
 */
const AuthEnvSchema = object({
  DATABASE_URL: string(),
  COOKIE_SECURE: optional(string()),
  NODE_ENV: string(),
});

export const env = parse(AuthEnvSchema, process.env as Record<string, string>); 