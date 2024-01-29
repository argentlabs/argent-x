import { mergeConfig } from "vitest/config"

import viteConfig from "./vite.config"

export default mergeConfig(viteConfig, {
  test: {
    deps: {
      optimizer: {
        web: {
          enabled: false,
        },
      },
    },
    environment: "happy-dom",
    exclude: ["**/node_modules/**", "**/*.mock.ts"],
    coverage: {
      exclude: [
        "**/*.mock.ts",
        "**/setup.ts",
        "**/*.json",
        "**/*.config.{js,ts}",
        "test{,s}/**",
        "spec{,s}/**",
        "test{,-*}.{js,cjs,mjs,ts,tsx,jsx}",
        "spec{,-*}.{js,cjs,mjs,ts,tsx,jsx}",
        "**/*.d.ts",
      ],
      reportsDirectory: "./coverage",
      excludeNodeModules: true,
      reporter: ["text", "lcov"],
      all: true,
    },
  },
})
