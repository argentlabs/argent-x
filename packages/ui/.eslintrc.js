module.exports = {
  extends: ["../extension/.eslintrc.base.js"],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["scripts", "vitest.config.ts"],
  rules: {
    "react/prop-types": "off",
  },
}
