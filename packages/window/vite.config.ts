import { resolve as resolvePath } from "path"

import dts from "vite-plugin-dts"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolvePath(__dirname, "src/index.ts"),
      name: "window",
      formats: ["es", "umd"],
      fileName: (format) => `window.${format}.js`,
    },
    emptyOutDir: false,
    rollupOptions: {
      external: ["starknet"],
    },
  },
  test: {
    environment: "happy-dom",
    exclude: ["**/node_modules/**", "**/*.mock.ts"],
    coverage: {
      exclude: ["**/node_modules/**", "**/*.mock.ts"],
    },
  },
})
