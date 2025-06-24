import * as v from 'valibot';
import type { Config } from 'drizzle-kit';
import { config as loadEnv } from 'dotenv-flow';
import { join } from 'path';

// Load env vars from monorepo root
loadEnv({ path: join(__dirname, '../..') });

const envSchema = v.object({
  DATABASE_URL: v.pipe(v.string(), v.minLength(1)),
});

// eslint-disable-next-line perfectionist/sort-imports
const env = v.parse(envSchema, process.env as Record<string, string>);

// Normalize Supabase pooling URL (6543 -> 5432) if present
const nonPoolingUrl = env.DATABASE_URL.replace(':6543', ':5432');

export default {
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: { url: nonPoolingUrl },
  casing: 'snake_case',
} satisfies Config;
