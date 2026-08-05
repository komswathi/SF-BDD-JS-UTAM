import { defineConfig } from 'eslint/config';
import eslintJs from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest';
import salesforceLwcConfig from '@salesforce/eslint-config-lwc/recommended';
import i18n from '@salesforce/eslint-config-lwc/i18n';
import globals from 'globals';

export default defineConfig([
  // LWC configuration for force-app/main/default/lwc
  {
    files: ['force-app/main/default/lwc/**/*.js'],
    extends: [salesforceLwcConfig, i18n],
    rules: {
      '@lwc/lwc/no-async-operation': 'off',
      '@lwc/lwc/consistent-component-name': 'error',
      '@lwc/lwc/no-deprecated': 'error',
      '@lwc/lwc/valid-api': 'error',
      '@lwc/lwc/no-document-query': 'error',
      'no-console': 'error',
      'spaced-comment': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-spread': 'error',
      'prefer-object-spread': 'error',
      'prefer-template': 'error',
      camelcase: 'error',
      'max-lines': ['error', 500],
      'max-lines-per-function': ['error', 50],
      'no-inline-comments': 'error',
      'no-nested-ternary': 'error'
    }
  },

  // LWC configuration with override for LWC test files
  {
    files: ['force-app/main/default/lwc/**/*.test.js'],
    languageOptions: { globals: { ...globals.node } },
    extends: [salesforceLwcConfig],
    rules: {
      '@lwc/lwc/no-unexpected-wire-adapter-usages': 'off',
      '@locker/locker/distorted-element-shadow-root-getter': 'off',
      'max-lines-per-function': 'off'
    }
  },

  // Jest mocks configuration
  {
    files: ['force-app/test/jest-mocks/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: { ...globals.node, ...globals.es2021, ...jestPlugin.environments.globals.globals }
    },
    plugins: { eslintJs },
    extends: ['eslintJs/recommended']
  },

  // UTAM tests configuration
  {
    files: ['force-app/test/utam/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: { ...globals.node, ...globals.es2021, ...globals.jasmine, utam: 'readonly', browser: 'readonly' }
    },
    plugins: { eslintJs },
    extends: ['eslintJs/recommended']
  }
]);
