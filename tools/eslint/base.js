/// <reference types="./types.d.ts" />

import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboConfig from 'eslint-config-turbo/flat';
import eslintPluginImport from 'eslint-plugin-import';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

export const restrictEnvAccess = tseslint.config(
  { ignores: ['**/env.server.ts', '**/env.client.ts', 'dist/**'] },
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message:
            'Avoid using process.env directly - validate your types with valibot (example in ./apps/server/env.ts)',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          name: 'process',
          importNames: ['env'],
          message:
            'Avoid using process.env directly - validate your types with valibot (example in ./apps/server/env.ts)',
        },
      ],
    },
  },
);

export default tseslint.config([
  { ignores: ['dist/**'] },
  ...turboConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  ...restrictEnvAccess,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      'import/no-cycle': 'warn'
    },
  },
  {
    rules: {
      semi: ['error', 'always'],
    },
  },
  {
    files: ['**/drizzle.config.ts'],
    rules: {
      'no-restricted-properties': 'off',
      'no-restricted-imports': 'off',
    },
  },
]);
