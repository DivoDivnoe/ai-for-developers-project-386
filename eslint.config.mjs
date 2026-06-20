import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import { flatConfigs as importXFlatConfigs } from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'openapi/**',
      'spec/**',
      'pnpm-lock.yaml',
      '**/*.yaml',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  importXFlatConfigs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
    },
    rules: {
      'import-x/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
        },
      ],
    },
  },
  prettierConfig,
);
