import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import svelteConfig from './svelte.config.js';

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: tseslint.parser,
        svelteConfig,
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: tseslint.parser,
        svelteConfig,
      },
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'src/shared/styles/tokens.*'],
  },
]);