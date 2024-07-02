/* eslint-env node */
module.exports = {
  root: true,
  plugins: ['unused-imports', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    extraFileExtensions: ['.vue'],
    ecmaVersion: 'latest'
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'import/order': [
      'warn',
      {
        groups: [['external', 'builtin'], 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        pathGroupsExcludedImportTypes: [],
        pathGroups: [
          {
            pattern: '~/**',
            group: 'parent'
          }
        ]
      }
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }
    ],
    'import/no-unresolved': 'off',
    'unused-imports/no-unused-imports': 'error'
  }
};
