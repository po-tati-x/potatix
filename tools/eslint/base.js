/// <reference types="./types.d.ts" />

import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboConfig from 'eslint-config-turbo/flat';
import eslintPluginImport from 'eslint-plugin-import';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginPromise from 'eslint-plugin-promise';
import tseslint from 'typescript-eslint';

export const restrictEnvAccess = tseslint.config(
  {
    // Allow use of `process.env` in dedicated environment definitions and build-time
    // configuration files (e.g. drizzle.config.ts). These files run in Node during
    // tooling, not in application code, so direct access is acceptable.
    ignores: [
      '**/env.server.ts',
      '**/env.client.ts',
      '**/*.config.ts',
      '**/dist/**',
      'dist/**',
    ],
  },
  {
    files: ['**/*.{js,ts,tsx}'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message:
            'Avoid using process.env directly – validate via valibot (see ./apps/server/env.ts)',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          name: 'process',
          importNames: ['env'],
          message:
            'Avoid using process.env directly – validate via valibot (see ./apps/server/env.ts)',
        },
      ],
    },
  },
);

export default tseslint.config([
  // Provide TypeScript project context so type-aware rules have program info.
  tseslint.config({
    languageOptions: {
      parserOptions: {
        // Root project tsconfig references all subprojects; this is enough.
        project: ['./tsconfig.json'],
      },
    },
  }),
  { ignores: ['**/dist/**', 'dist/**', '**/.next/**', '.next/**', '**/node_modules/**', 'node_modules/**'] },

  // Base recommended rule sets
  ...turboConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // Community plugins - use flat config to avoid legacy parserOptions
  pluginPromise.configs['flat/recommended'],
  pluginUnicorn.configs.flat?.recommended ?? pluginUnicorn.configs.recommended,

  // Custom project-specific rules
  restrictEnvAccess,
  {
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'error',
      'import/no-cycle': 'error',
      semi: ['error', 'always'],
      // Disable buggy rule until upstream fixes; causes crash under ESLint 9.
      'unicorn/expiring-todo-comments': 'off',
      // Stop bitching about Props vs Properties.
      'unicorn/prevent-abbreviations': 'off',
    },
  },
]);
