module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx|js)?$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!(url-join|lodash-es)/)"],
}
