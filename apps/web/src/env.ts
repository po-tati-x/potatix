import { object, string, pipe, url, parse, optional } from 'valibot';

const EnvSchema = object({
  NEXT_PUBLIC_APP_URL: pipe(string(), url()),
  // Cloudflare R2
  CLOUDFLARE_R2_ACCOUNT_ID: string(),
  CLOUDFLARE_R2_ACCESS_KEY: string(),
  CLOUDFLARE_R2_SECRET_KEY: string(),
  CLOUDFLARE_R2_BUCKET_NAME: string(),
  CLOUDFLARE_R2_PUBLIC_URL: pipe(string(), url()),
  // Mux
  MUX_TOKEN_ID: string(),
  MUX_TOKEN_SECRET: string(),
  // Database & Auth
  DATABASE_URL: string(),
  BETTER_AUTH_SECRET: string(),
  BETTER_AUTH_URL: optional(string()),
  AUTH_COOKIE_DOMAIN: optional(string()),
  // PostHog public keys
  NEXT_PUBLIC_POSTHOG_KEY: string(),
  // PostHog host (optional, can override default)
  NEXT_PUBLIC_POSTHOG_HOST: optional(pipe(string(), url())),
  // Logging / misc
  NODE_ENV: string(),
  LOG_SERVICES: optional(string()),
});

export const env = parse(EnvSchema, process.env); 