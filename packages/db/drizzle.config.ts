import * as v from 'valibot';
import type { Config } from 'drizzle-kit';

const envSchema = v.object({
  DB_POSTGRES_URL: v.pipe(v.string(), v.minLength(1)),
});

// eslint-disable-next-line perfectionist/sort-imports
const env = v.parse(
  envSchema,
  process.env as unknown as Record<string, string>,
);

// Supabase pooling URL uses 6543, which we don't need for migrations
const nonPoolingUrl = env.DB_POSTGRES_URL.replace(':6543', ':5432');

export default {
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: { url: nonPoolingUrl },
  casing: 'snake_case',
} satisfies Config;
