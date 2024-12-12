module.exports = {
  extends: [".eslintrc.base.js", "prettier"],
  plugins: ["@argent/eslint-plugin-local"],
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
          {
            name: "lodash-es",
            importNames: ["memoize"],
            message: "Please use memoizee instead of lodash memoize.",
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
        message: "import @argent/x-ui or background from shared is disallowed",
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
}
