import { object, string, parse } from 'valibot';

// Server-side environment schema for the database package. Only evaluated in Node context,
// therefore accessing `process.env` directly here is permissible.
const DatabaseEnvSchema = object({
  DATABASE_URL: string(),
});

export const databaseEnvironment = parse(DatabaseEnvSchema, process.env); 