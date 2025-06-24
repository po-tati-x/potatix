import reactConfig from '@potatix/eslint-config/react';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  ...reactConfig,
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
    },
  },
];
