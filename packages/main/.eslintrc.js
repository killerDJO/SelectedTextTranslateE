module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    tsconfigRootDir: __dirname
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'unused-imports'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  root: true,
  env: {
    node: true
  },
  ignorePatterns: ['.eslintrc.js', 'node_modules', 'dist', '*.d.ts', '*.js'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
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
    'import/no-unresolved': 'off',
    'unused-imports/no-unused-imports': 'error'
  }
};
