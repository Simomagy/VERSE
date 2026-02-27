import { defineConfig } from 'eslint/config'
import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'

export default defineConfig(
  { ignores: ['**/node_modules', '**/dist', '**/out', 'tailwind.config.js', 'postcss.config.js'] },
  tseslint.configs.recommended,
  // React plugin scoped to renderer files only to avoid version-detection
  // failures on non-React files (e.g. electron.vite.config.ts)
  {
    ...eslintPluginReact.configs.flat.recommended,
    files: ['src/renderer/**/*.{ts,tsx}'],
    settings: { react: { version: '19' } }
  },
  {
    ...eslintPluginReact.configs.flat['jsx-runtime'],
    files: ['src/renderer/**/*.{ts,tsx}'],
    settings: { react: { version: '19' } }
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.vite.rules,
      // exhaustive-deps as warning — strict enough without blocking builds
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    // Project-wide rule overrides
    rules: {
      // TypeScript infers return types from JSX — explicit annotations are redundant
      '@typescript-eslint/explicit-function-return-type': 'off',
      // TypeScript interfaces/props already enforce shape — prop-types is redundant
      'react/prop-types': 'off',
      // `any` is intentional in IPC preload bridges and API clients
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },
  eslintConfigPrettier
)
