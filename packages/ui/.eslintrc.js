module.exports = {
  extends: ["../extension/.eslintrc.js"],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["scripts"],
  rules: {
    "react/prop-types": "off",
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
