module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx|js)?$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!(url-join|lodash-es)/)"],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"],
}
