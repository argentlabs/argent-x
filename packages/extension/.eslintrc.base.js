module.exports = {
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    ".eslintrc.base.js",
    "**/dist/**",
    "**/node_modules/**",
    "vite.config.ts",
    "webpack.config.js",
  ],
  plugins: ["react", "react-hooks", "@typescript-eslint"],
  rules: {
    "react/jsx-no-target-blank": "off",
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
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
    "no-restricted-globals": ["error", "origin"], // Error on use of global 'origin' which defaults to current window url
  },
}
