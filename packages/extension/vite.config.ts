import path from "path"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: "test/setup.ts",
    environment: "jsdom",
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
        "**/node_modules/**",
        "**/dist/**",
        "**/e2e/**",
        "**/.{idea,git,cache,output,temp}/**",
        "**/*.test.{js,cjs,mjs,ts,tsx,jsx}",
      ],
      reportsDirectory: "./coverage",
      excludeNodeModules: true,
      reporter: ["text", "lcov"],
      all: true,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      provider: "istanbul",
    },
    /** TODO: remove after refactor: this allows testing of components that import .svg directly */
    alias: [
      {
        find: /^(.*)\.svg$/,
        replacement: path.resolve("./test/__mocks__/Svg.mock.tsx"),
      },
    ],
  },
})
