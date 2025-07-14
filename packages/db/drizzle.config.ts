import path from 'node:path'; // `node:` protocol and default import satisfy unicorn rules
import { fileURLToPath } from 'node:url';
import * as v from 'valibot';
import type { Config } from 'drizzle-kit';
import { config as loadEnvironment } from 'dotenv-flow';

// Resolve the monorepo root directory without relying on __dirname (ESM-friendly)
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(currentDir, '../..');

// Load environment variables from the monorepo root `.env*` files
loadEnvironment({ path: repoRoot });

// Validate required environment variables
const environmentSchema = v.object({
  DATABASE_URL: v.pipe(v.string(), v.minLength(1)),
});

const environment = v.parse(environmentSchema, process.env as Record<string, string>);

// The pooled connection string provided by Fly.io proxies on port 6543. Replace
// it with the direct Postgres port so Drizzle CLI can connect without PgBouncer.
const nonPoolingUrl = environment.DATABASE_URL.replace(':6543', ':5432');

export default {
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: { url: nonPoolingUrl },
  casing: 'snake_case',
} satisfies Config;
