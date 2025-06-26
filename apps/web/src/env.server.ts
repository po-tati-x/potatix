import { object, string, pipe, url, parse, optional } from "valibot"


// Server-side environment schema
const ServerEnvSchema = object({
  // Database & Auth
  DATABASE_URL: string(),
  BETTER_AUTH_SECRET: string(),
  BETTER_AUTH_URL: optional(string()),
  AUTH_COOKIE_DOMAIN: string(),

  // Third-party services
  GOOGLE_CLIENT_ID: string(),
  GOOGLE_CLIENT_SECRET: string(),
  GITHUB_CLIENT_ID: string(),
  GITHUB_CLIENT_SECRET: string(),
  RESEND_API_KEY: string(),
  GOOGLE_GENERATIVE_AI_API_KEY: string(),

  // Cloudflare R2
  CLOUDFLARE_R2_ACCOUNT_ID: string(),
  CLOUDFLARE_R2_ACCESS_KEY: string(),
  CLOUDFLARE_R2_SECRET_KEY: string(),
  CLOUDFLARE_R2_BUCKET_NAME: string(),
  CLOUDFLARE_R2_PUBLIC_URL: pipe(string(), url()),

  // Mux
  MUX_TOKEN_ID: string(),
  MUX_TOKEN_SECRET: string(),

  // System
  NODE_ENV: string(),
  LOG_SERVICES: optional(string()),
  COOKIE_SECURE: optional(string()),
  // Public base URL (optional)
  NEXT_PUBLIC_APP_URL: optional(pipe(string(), url())),
})

// Server-side env (only use on server)
export const env = parse(ServerEnvSchema, process.env) 