import { resolve } from "path"

import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "ui",
      // the proper extensions will be added
      fileName: "ui",
    },
  },
  plugins: [
    svelte({ emitCss: false }),
    dts({
      entryRoot: resolve(__dirname, "src"),
      insertTypesEntry: true,
    }),
  ],
})
