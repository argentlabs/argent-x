import { resolve } from "path"

import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: false,
    target: "es2020",
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "web-sdk",
      // the proper extensions will be added
      fileName: "web-sdk",
    },
  },
  plugins: [
    dts({
      entryRoot: resolve(__dirname, "src"),
      insertTypesEntry: true,
    }),
  ],
})
