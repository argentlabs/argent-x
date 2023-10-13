module.exports = {
  extends: ["../extension/.eslintrc.js"],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["scripts", "vitest.config.ts"],
  rules: {
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          "{}": false /** Empty type in 'dist' build from chakra-ui */,
        },
        extendDefaults: true,
      },
    ],
  },
}
