import tseslint from "typescript-eslint"
import baseConfig from "../extension/eslint.base.mjs"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default tseslint.config({
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: __dirname,
    },
  },
  ignores: ["eslint.config.mjs", "**/storybook-static/**", "**/.storybook/**"],
  extends: [baseConfig],
})
