import nextConfig from '@potatix/eslint-config/next';
import reactHooksExtra from 'eslint-plugin-react-hooks-extra';

export default [
  ...nextConfig,
  // Project-specific TypeScript context
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  },
  // Local overrides
  {
    plugins: {
      'react-hooks-extra': reactHooksExtra,
    },
    rules: {
      'react-hooks-extra/no-direct-set-state-in-use-effect': 'error',
    },
  },
];