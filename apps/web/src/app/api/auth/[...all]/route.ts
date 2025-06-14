import { auth } from "@/lib/auth/auth-server";
import { toNextJsHandler } from "better-auth/next-js";

// This handles all auth-related API requests
export const { GET, POST } = toNextJsHandler(auth);
