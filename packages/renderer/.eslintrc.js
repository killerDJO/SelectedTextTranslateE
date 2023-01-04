/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  plugins: ['unused-imports'],
  extends: [
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    tsconfigRootDir: __dirname
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'import/order': [
      'warn',
      {
        groups: [['external', 'builtin'], 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        pathGroupsExcludedImportTypes: [],
        pathGroups: [
          {
            pattern: '@selected-text-translate/common/**',
            group: 'internal'
          },
          {
            pattern: '~/**',
            group: 'parent'
          }
        ]
      }
    ],
    'unused-imports/no-unused-imports': 'error',
    'import/no-unresolved': 'off'
  }
};
