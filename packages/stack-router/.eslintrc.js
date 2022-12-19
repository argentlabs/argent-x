module.exports = {
  extends: ["../extension/.eslintrc.js"],
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
