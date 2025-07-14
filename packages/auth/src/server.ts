import { type BetterAuthOptions, betterAuth } from 'better-auth';

import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { DatabaseInstance } from '@potatix/db/client';
import type { BetterAuthPlugin } from 'better-auth';
import { env as environment } from './env.server';

export interface AuthOptions {
  webUrl: string;
  authSecret: string;
  /**
   * Database connection instance used by Better Auth. Renamed from the
   * previous `db` to avoid abbreviations and satisfy the linter.
   */
  database: DatabaseInstance;
  /**
   * Optional Better-Auth plugins. The library does not expose proper typings,
   * so we default to `unknown` to avoid the dreaded `any` while still allowing
   * arbitrary plugin objects.
   */
  plugins?: BetterAuthPlugin[];
  cookieDomain: string;
  /**
   * Social providers configuration forwarded sto Better Auth `socialProviders` option.
   * Use the same shape expected by Better Auth. Optional.
   */
  socialProviders?: Record<string, unknown>;
}

export type AuthInstance = ReturnType<typeof createAuth>;

/**
 * This function is abstracted for schema generations in cli-config.ts
 */
export const getBaseOptions = (database: DatabaseInstance) =>
  ({
    database: drizzleAdapter(database, {
      provider: 'pg',
    }),

    /**
     * Only uncomment the line below if you are using plugins, so that
     * your types can be correctly inferred:
     */
    // plugins: [],
  }) satisfies BetterAuthOptions;

export const createAuth = ({
  webUrl,
  database,
  authSecret,
  plugins = [] as BetterAuthPlugin[],
  cookieDomain,
  socialProviders,
}: AuthOptions) => {
  const urlProtocol = (() => {
    try {
      return new URL(webUrl).protocol;
    } catch {
      return 'http:';
    }
  })();
  const secureFlag = environment.COOKIE_SECURE ? environment.COOKIE_SECURE === 'true' : urlProtocol === 'https:';

  const sanitizedDomain = cookieDomain.replace(/^\./, "");

  return betterAuth({
    ...getBaseOptions(database),
    secret: authSecret,
    // Forward social providers configuration if provided
    ...(socialProviders ? { socialProviders } : {}),
    // Allow wildcard sub-domains when a cookieDomain is provided (e.g. ".ptx.com")
    // Better-Auth supports wildcard patterns like "*.example.com", so we add them here
    // to avoid manually enumerating every preview/tenant sub-domain.
    trustedOrigins: (() => {
      const origins = new Set<string>();

      // Always trust the exact webUrl origin
      origins.add(new URL(webUrl).origin);

      // If a cookieDomain is specified, broaden trust to all its sub-domains
      if (sanitizedDomain) {
        origins.add(`*.${sanitizedDomain}`); // protocol-agnostic wildcard

        // NOTE: Better-Auth does not support wildcard-with-port yet. In dev we disable CSRF instead.
      }

      return [...origins];
    })(),
    // No in-memory cookie cache – rely entirely on browser cookies
    // (Better Auth defaults are fine; session config omitted.)
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: false, // for dev false, to be changed in future, do not touch
    },
    // Ensure auth cookies are sent on every route, not just /api/auth
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: sanitizedDomain,
      },
      defaultCookieAttributes: {
        path: '/',
        sameSite: 'lax',
        secure: secureFlag,
      },
      // Disable CSRF only in local dev where we rely on non-standard ports (e.g. :8888)
      disableCSRFCheck: environment.NODE_ENV !== 'production',
    },
    plugins, // Add plugins support
  });
};
