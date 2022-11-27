import { resolve as resolvePath } from "path"

import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

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
})
