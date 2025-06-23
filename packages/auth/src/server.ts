import { type BetterAuthOptions, betterAuth } from 'better-auth';

import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { DatabaseInstance } from '@potatix/db/client';

export interface AuthOptions {
  webUrl: string;
  authSecret: string;
  db: DatabaseInstance;
  plugins?: any[]; // Allow plugins to be passed
  cookieDomain?: string;
}

export type AuthInstance = ReturnType<typeof createAuth>;

/**
 * This function is abstracted for schema generations in cli-config.ts
 */
export const getBaseOptions = (db: DatabaseInstance) =>
  ({
    database: drizzleAdapter(db, {
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
  db,
  authSecret,
  plugins = [],
  cookieDomain,
}: AuthOptions) => {
  const urlProtocol = (() => {
    try {
      return new URL(webUrl).protocol;
    } catch {
      return 'http:';
    }
  })();
  const secureFlag = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : urlProtocol === 'https:';

  return betterAuth({
    ...getBaseOptions(db),
    secret: authSecret,
    // Allow wildcard sub-domains when a cookieDomain is provided (e.g. ".ptx.com")
    // Better-Auth supports wildcard patterns like "*.example.com", so we add them here
    // to avoid manually enumerating every preview/tenant sub-domain.
    trustedOrigins: (() => {
      const origins = new Set<string>();

      // Always trust the exact webUrl origin
      origins.add(new URL(webUrl).origin);

      // If a cookieDomain is specified, broaden trust to all its sub-domains
      if (cookieDomain) {
        const domain = cookieDomain.replace(/^\./, ''); // strip leading dot if present
        origins.add(`*.${domain}`); // protocol-agnostic wildcard

        // NOTE: Better-Auth does not support wildcard-with-port yet. In dev we disable CSRF instead.
      }

      return [...origins];
    })(),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: false, // for dev false, to be changed in future, do not touch
    },
    // Ensure auth cookies are sent on every route, not just /api/auth
    advanced: {
      crossSubDomainCookies: cookieDomain
        ? {
            enabled: true,
            domain: cookieDomain,
          }
        : undefined,
      defaultCookieAttributes: {
        path: '/',
        sameSite: 'lax',
        secure: secureFlag,
      },
      // Disable CSRF only in local dev where we rely on non-standard ports (e.g. :8888)
      disableCSRFCheck: process.env.NODE_ENV !== 'production',
    },
    plugins, // Add plugins support
  });
};
