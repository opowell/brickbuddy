import antfu from '@antfu/eslint-config'
import globals from 'globals'
import AutoImportGlobals from './src/types/.eslintrc-auto-import.json' with { type: 'json' }
import pluginVue from 'eslint-plugin-vue'

export default antfu(
  ...pluginVue.configs['flat/recommended'],
  {
    stylistic: false,
    typescript: true,
    vue: true,
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.worker,
        ...globals.webextensions,
        ...AutoImportGlobals.globals,
      },
    },
  },
  {
    ignores: [
      'node_modules',
      'dist',
      '**/*.js',
      '**/*.d.ts',
      'public',
      'build',
      'coverage',
      'tests',
      'cypress',
      'src/types/**/*',
      'eslint.config.mjs',
    ],
  },
  {
    rules: {
      'no-alert': 'warn',
      'no-console': 'warn',
      'no-restricted-globals': 'warn',
      'perfectionist/sort-imports': 'warn',
      'import/order': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'vue/multi-word-component-names': 'warn',
      '@eslint-community/eslint-comments/no-unlimited-disable': 'off',
      'ts/explicit-function-return-type': 'off',
      "@html-eslint/attrs-newline": "error",
      "function-paren-newline": ["error", { "minItems": 3 }]
    },
  }
)
