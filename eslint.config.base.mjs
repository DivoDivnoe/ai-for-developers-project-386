import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import { flatConfigs as importXFlatConfigs } from 'eslint-plugin-import-x';
import preferArrow from 'eslint-plugin-prefer-arrow-functions';
import tseslint from 'typescript-eslint';

export const base = tseslint.config(
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
    plugins: { 'prefer-arrow-functions': preferArrow },
    rules: {
      'func-style': ['error', 'expression'],
      'prefer-arrow-functions/prefer-arrow-functions': [
        'error',
        {
          allowedNames: [],
          allowNamedFunctions: false,
          allowObjectProperties: false,
          classPropertiesAllowed: false,
          disallowPrototype: false,
          returnStyle: 'unchanged',
          singleReturnOnly: false,
        },
      ],
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
