import { resolve } from "path"

import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["starknet", "react", "react-dom"],
      output: {
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    emptyOutDir: false,
    target: "es2020",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "shared",
      // the proper extensions will be added
      fileName: "shared",
    },
  },
  optimizeDeps: {
    include: ["starknet"],
  },
  plugins: [
    dts({
      entryRoot: resolve(__dirname, "src"),
      insertTypesEntry: true,
    }),
  ],
})
