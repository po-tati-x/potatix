import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env.local file
config({ path: '.env.local' });

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schemas/*.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    ssl: {
      rejectUnauthorized: false
    },
  },
});