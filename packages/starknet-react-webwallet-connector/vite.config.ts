import { resolve } from "path"

import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["starknet"],
      onwarn(warning, warn) {
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.message.includes(`"use client"`)
        ) {
          return
        }
        warn(warning)
      },
    },
    emptyOutDir: false,
    target: "es2020",
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "webwallet-connector",
      // the proper extensions will be added
      fileName: "webwallet-connector",
    },
  },
  plugins: [
    dts({
      entryRoot: resolve(__dirname, "src"),
      insertTypesEntry: true,
    }),
  ],
})
