import { resolve as resolvePath } from "path"

import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

import pkg from "./package.json"

export default defineConfig(({ mode }) => ({
  plugins: [
    dts({
      insertTypesEntry: true,
      tsconfigPath: resolvePath(__dirname, "tsconfig.json"),
      exclude: ["eslint.config.mjs"],
    }),
    react(),
  ],
  build: {
    lib: {
      entry: {
        index: resolvePath(__dirname, "src/index.ts"),
      },
      name: "stack-router",
    },
    // only clean build folder in production - reduces 'hot reload' file system events in development
    emptyOutDir: mode === "production",
    // source maps only in development
    sourcemap: mode === "development",
    rollupOptions: {
      external: [
        // omit all peer dependencies
        ...Object.keys(pkg.peerDependencies),
        // additional used packages - check for these by setting preserveModules: true below and checking for node_modules in dist folder
        "react/jsx-runtime",
        "@chakra-ui/react",
      ],
      output: {
        // preserveModules: true,
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
  esbuild: {
    // strip console in production
    pure: mode === "production" ? ["console.log", "console.warn"] : [],
  },
}))
