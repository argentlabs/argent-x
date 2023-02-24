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
      exclude: ["**/*.mock.ts", "**/setup.ts"],
      reportsDirectory: "./coverage",
      reporter: ["text", "lcov"],
      all: true,
    },
  },
})
