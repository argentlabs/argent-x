import { resolve as resolvePath } from "path"

import react from "@vitejs/plugin-react"
import { PluginOption, defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
    react() as PluginOption, // stops TS from complaining
  ],
  build: {
    lib: {
      entry: resolvePath(__dirname, "src/index.ts"),
      name: "x-swap",
      formats: ["es", "umd"],
      fileName: (format) => `x-swap.${format}.js`,
    },

    emptyOutDir: false,
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        // sourcemapExcludeSources: true,
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    sourcemap: true,
    target: "esnext",

    // Leave minification up to applications.
    minify: false,
  },
})
