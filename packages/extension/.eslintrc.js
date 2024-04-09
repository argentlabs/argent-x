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
        target: "packages/extension/src/background/**",
        disallow: ["@argent/x-ui"],
        message: "import @argent/x-ui from background is disallowed",
      },
      {
        target: "packages/extension/src/shared/**",
        disallow: ["@argent/x-ui", "packages/extension/src/background/**"],
        message: "import @argent/x-ui or background from shared is disallowed",
      },
    ],
  },
}
