import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from '@/env.server';

// Singleton Upstash Redis instance – re-used across hot reloads in dev & serverless invocations
if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis env vars');
}

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// 10 chat invocations per minute (sliding window)
export const chatRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "rate:chat",
});

export async function limitChat(key: string) {
  // Returns success flag and remaining tokens
  const { success, remaining } = await chatRateLimiter.limit(key);
  return { success, remaining };
} 