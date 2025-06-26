import { createAuthClient as createBetterAuthClient } from 'better-auth/react';

export interface AuthClientOptions {
  /**
   * Base URL of the Better-Auth server. Pass an empty string to use the current origin.
   * Mirrors the `baseURL` option name used by Better-Auth itself.
   */
  baseURL?: string;
}

export const createAuthClient = ({ baseURL = "" }: AuthClientOptions = {}) =>
  createBetterAuthClient({
    baseURL,

    /**
     * Only uncomment the line below if you are using plugins, so that
     * your types can be correctly inferred.
     * Ensure that you are using the client-side version of the plugin,
     * e.g. `adminClient` instead of `admin`.
     */
    // plugins: []
  });
