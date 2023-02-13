module.exports = {
  extends: ["../extension/.eslintrc.js"],
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
