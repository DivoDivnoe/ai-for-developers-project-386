import tseslint from 'typescript-eslint';

import { base } from '../eslint.config.base.mjs';

export default tseslint.config(...base, {
  files: ['**/*.ts'],
  settings: {
    'import-x/extensions': ['.ts'],
    'import-x/parsers': { '@typescript-eslint/parser': ['.ts'] },
    'import-x/resolver': {
      typescript: { project: './tsconfig.json', tsconfigRootDir: import.meta.dirname },
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
    ],
  },
});
