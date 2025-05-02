import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Convert the auth handler to Next.js handler
// This handles all auth-related API requests
export const { GET, POST } = toNextJsHandler(auth.handler); 