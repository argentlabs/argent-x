import eslint from "@eslint/js"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import globals from "globals"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import tseslint from "typescript-eslint"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default tseslint.config({
  settings: {
    react: {
      version: "detect",
    },
  },

  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    reactPlugin.configs.flat.recommended,
  ],

  ignores: [
    "**/dist/**",
    "./eslint.base.mjs",
    "./vite.config.ts",
    "./webpack.config.js",
    "**/node_modules/**",
    "./dist/**",
  ],

  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: "latest",
      sourceType: "module",
      project: "./tsconfig.json",
      tsconfigRootDir: __dirname,
    },
    globals: {
      ...globals.node,
      ...globals.browser,
      ...globals.es2021,
    },
  },

  plugins: {
    react: reactPlugin,
    "@typescript-eslint": tseslint.plugin,
    "react-hooks": reactHooksPlugin,
  },

  rules: {
    "react/jsx-no-target-blank": "off",
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-extra-semi": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        vars: "all",
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-non-null-assertion": "error",
    curly: "error",
    "@typescript-eslint/no-misused-promises": "warn",
    "@typescript-eslint/no-floating-promises": "warn",
    "no-restricted-globals": ["error", "origin"],
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/consistent-type-imports": "error",
  },
})
