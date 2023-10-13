import { defineConfig, mergeConfig } from "vitest/config"

import viteConfig from "./vite.config"

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "happy-dom",
      globals: true,
      setupFiles: "test/setup.ts",
      testTimeout: 50 * 60 * 1000,
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/e2e/**",
        "**/.{idea,git,cache,output,temp}/**",
      ],
      coverage: {
        exclude: [
          "**/*.mock.ts",
          "**/setup.ts",
          "**/*.json",
          "**/*.config.{js,ts}",
          "test{,s}/**",
          "test{,-*}.{js,cjs,mjs,ts,tsx,jsx}",
          "**/*.d.ts",
        ],
        reportsDirectory: "./coverage",
        excludeNodeModules: true,
        reporter: ["text", "lcov"],
        all: true,
      },
    },
  }),
)
