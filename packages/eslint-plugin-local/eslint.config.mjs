import js from "@eslint/js"
import tseslint from "typescript-eslint"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"
import globals from "globals"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default [
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
      },
    },

    files: ["**/*.ts"],
    ignores: ["**/dist/**", "**/node_modules/**"],

    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },

    rules: {
      ...js.configs.recommended.rules,
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
    },
  },
]
