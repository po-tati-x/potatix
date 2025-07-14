import nextPlugin from '@next/eslint-plugin-next';
import reactConfig from './react.js';
import tseslint from 'typescript-eslint';

export default tseslint.config([
  ...reactConfig,
  // Next.js recommended + Core Web Vitals rules
  nextPlugin.flatConfig.coreWebVitals,
  {
    // Additional project-specific overrides for Next rules can go here
    rules: {},
  },
]); 