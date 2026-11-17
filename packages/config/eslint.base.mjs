import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * Shared flat ESLint configuration for OneXDeal workspaces.
 * Enforces strict TypeScript discipline and prohibits casual `any`.
 */
export function createBaseEslintConfig(ignores = []) {
  return tseslint.config(
    {
      ignores: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/.expo/**',
        '**/.turbo/**',
        '**/coverage/**',
        ...ignores,
      ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
        'no-console': ['error', { allow: ['warn', 'error'] }],
      },
    },
  );
}

export default createBaseEslintConfig();
