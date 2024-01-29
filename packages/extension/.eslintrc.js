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
        target: "packages/extension/src/shared/**",
        disallow: [
          "packages/extension/src/ui/**",
          "packages/extension/src/background/**",
        ],
        message: "import ui or background from shared is disallowed",
      },
    ],
  },
}
