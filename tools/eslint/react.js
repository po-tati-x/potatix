import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReact from 'eslint-plugin-react';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
import baseConfig from './base.js';
import tseslint from 'typescript-eslint';

export default tseslint.config([
  // Inherit the hardened base rules
  ...baseConfig,

  // React & accessibility rule sets (flat configs only)
  pluginReact.configs.flat.recommended,
  {
    // Transform legacy jsx-a11y recommended config into flat-compatible format (drop parserOptions)
    plugins: { 'jsx-a11y': pluginJsxA11y },
    rules: { ...pluginJsxA11y.configs.recommended.rules },
  },

  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
    },
  },
]);
