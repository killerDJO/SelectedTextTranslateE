import pluginVue from 'eslint-plugin-vue';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import eslintConfigPrettier from 'eslint-config-prettier';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  importPlugin.flatConfigs.errors,
  importPlugin.flatConfigs.warnings,
  importPlugin.flatConfigs.typescript,
  eslintConfigPrettier,
  {
    plugins: {
      'unused-imports': unusedImports
    }
  },
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }
      ],
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
      'import/no-unresolved': 'off',
      'unused-imports/no-unused-imports': 'error'
    }
  }
);
