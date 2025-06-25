import { object, string, pipe, url, parse, optional } from "valibot"

// Client-side environment schema (only NEXT_PUBLIC_ vars)
const ClientEnvSchema = object({
  NEXT_PUBLIC_APP_URL: pipe(string(), url()),
  NEXT_PUBLIC_POSTHOG_KEY: string(),
  NEXT_PUBLIC_POSTHOG_HOST: optional(pipe(string(), url())),
})

// Client-side env (safe to use anywhere)
export const clientEnv = parse(ClientEnvSchema, {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
}) 