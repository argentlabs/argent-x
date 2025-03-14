import path from "path"

import { mergeConfig } from "vitest/config"

import viteConfig from "./vite.config"

// https://vitejs.dev/config/
export default mergeConfig(viteConfig, {
  test: {
    environment: "happy-dom",
    pool: "threads",
    globals: true,
    setupFiles: ["test/setup.ts", "fake-indexeddb/auto"],
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

      provider: "v8",
    },
    server: {
      deps: {
        /** Fix for `Named export not found` error - deps that ship .js in ESM format (that Node can't handle) */
        inline: [
          "@argent/x-shared",
          "@argent/x-ui",
          "@ledgerhq/hw-app-starknet",
        ],
      },
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
