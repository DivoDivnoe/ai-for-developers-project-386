import path from 'node:path';
import { fileURLToPath } from 'node:url';

import eslintReact from '@eslint-react/eslint-plugin';
import jsxa11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

import { base } from '../eslint.config.base.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  ...base,
  eslintReact.configs.recommended,
  jsxa11y.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    settings: {
      'import-x/extensions': ['.ts', '.tsx', '.cts', '.mts', '.js', '.jsx', '.cjs', '.mjs'],
      'import-x/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx', '.cts', '.mts'] },
      'import-x/resolver': {
        typescript: { project: './tsconfig.json', tsconfigRootDir: __dirname },
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      '@eslint-react/no-nested-component-definitions': 'off',
    },
  },
);
