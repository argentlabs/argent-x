import { resolve as resolvePath } from "path"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

/** Reduce bundlesize - maps dependencies that should be excluded from bundling to their global name */

export const externalGlobals = {
  react: "React",
  "react-dom": "ReactDOM",
  "react-router-dom": "ReactRouterDOM",
  "react/jsx-runtime": "ReactJSXRuntime",
  "react-copy-to-clipboard": "ReactCopyToClipboard",
  "@chakra-ui/react": "ChakraUIReact",
  "@chakra-ui/anatomy": "ChakraUIAnatomy",
  "@chakra-ui/theme-tools": "ChakraUIThemeTools",
  "@chakra-ui/styled-system": "ChakraUIStyledSystem",
  "framer-motion": "FramerMotion",
  popmotion: "PopMotion",
  colord: "Colord",
  "colord/plugins/lch": "ColordPluginsLCH",
  "@ethersproject/wordlists": "EthersProjectWordLists",
}

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
      name: "ui",
      formats: ["es", "umd"],
      fileName: (format) => `ui.${format}.js`,
    },
    emptyOutDir: false,
    rollupOptions: {
      external: Object.keys(externalGlobals),
      output: {
        globals: externalGlobals,
      },
    },
  },
})
