import { resolve } from "path"

import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["starknet", "dexie", "jose"],
      output: {
        exports: "named",
      },
    },
    emptyOutDir: false,
    target: "es2020",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "guardian",
      // the proper extensions will be added
      fileName: "guardian",
    },
  },
  optimizeDeps: {
    include: ["starknet", "dexie", "jose"],
  },
  plugins: [
    dts({
      entryRoot: resolve(__dirname, "src"),
      insertTypesEntry: true,
    }),
  ],
})
