import argentLocal from "@argent/eslint-plugin-local"
import prettier from "eslint-config-prettier"
import tseslint from "typescript-eslint"
import baseConfig from "./eslint.base.mjs"

export default tseslint.config(
  {
    extends: [baseConfig],
    ignores: [
      "./eslint.base.mjs",
      "./vite.config.ts",
      "./webpack.config.js",
      "**/dist/**",
      "**/node_modules/**",
    ],
  },
  prettier,
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin, // plugins are not carried over when extending configs
      "@argent/local": argentLocal,
    },
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lodash",
              message: "Please use lodash-es instead.",
              allowTypeImports: true,
            },
          ],
          patterns: [
            {
              group: ["**/ampli", "**/ampli/**"],
              importNames: ["ampli"],
              message: "Please import 'ampli' from 'shared/analytics' instead.",
            },
          ],
        },
      ],
      "@argent/local/code-import-patterns": [
        "error",
        {
          target: "packages/extension/src/ui/**",
          disallow: ["packages/extension/src/background/**"],
          message: "import background from ui is disallowed",
        },
        {
          target: "packages/extension/src/background/**",
          disallow: ["packages/extension/src/ui/**"],
          message: "import ui from background is disallowed",
        },
        {
          target: "packages/extension/src/background/**",
          disallow: ["@argent/x-ui"],
          message: "import @argent/x-ui from background is disallowed",
        },
        {
          target: "packages/extension/src/shared/**",
          disallow: ["@argent/x-ui", "packages/extension/src/background/**"],
          message:
            "import @argent/x-ui or background from shared is disallowed",
        },
        {
          target: "packages/extension/**",
          disallow: [
            "packages/extension/src/ampli",
            "packages/extension/src/ampli/**",
          ],
          message: "import from ampli is disallowed",
        },
      ],
    },
  },
)
