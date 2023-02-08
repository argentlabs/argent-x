import { resolve as resolvePath } from "path"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
    react(),
  ],
  build: {
    lib: {
      entry: resolvePath(__dirname, "src/index.ts"),
      name: "stack-router",
      formats: ["es", "umd"],
      fileName: (format) => `stack-router.${format}.js`,
    },
    emptyOutDir: false,
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react-router-dom",
        "react/jsx-runtime",
        "@chakra-ui/react",
        "framer-motion",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-router-dom": "ReactRouterDOM",
          "react/jsx-runtime": "ReactJSXRuntime",
          "@chakra-ui/react": "ChakraUIReact",
          "framer-motion": "FramerMotion",
        },
      },
    },
  },
})
