import { resolve as resolvePath } from "path"

import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      tsConfigFilePath: resolvePath(__dirname, "tsconfig.json"),
    }),
    react(),
  ],
  optimizeDeps: {
    include: ["starknet"],
  },
  build: {
    lib: {
      entry: resolvePath(__dirname, "src/index.ts"),
      name: "ui",
      formats: ["es", "umd"],
      fileName: (format) => `ui.${format}.js`,
    },
    emptyOutDir: false,
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react-router-dom",
        "starknet",
        "react/jsx-runtime",
        "@chakra-ui/react",
        "@chakra-ui/anatomy",
        "@chakra-ui/theme-tools",
        "@chakra-ui/styled-system",
        "framer-motion",
        "popmotion",
        "@ethersproject/wordlists",
      ],
      output: {
        globals: {
          react: "React",
          starknet: "starknet",
          "react-dom": "ReactDOM",
          "react-router-dom": "ReactRouterDOM",
          "react/jsx-runtime": "ReactJSXRuntime",
          "@chakra-ui/react": "ChakraUIReact",
          "@chakra-ui/button": "ChakraUIButton",
          "@chakra-ui/anatomy": "ChakraUIAnatomy",
          "@chakra-ui/theme-tools": "ChakraUIThemeTools",
          "@chakra-ui/styled-system": "ChakraUIStyledSystem",
          "framer-motion": "FramerMotion",
          popmotion: "PopMotion",
          "@ethersproject/wordlists": "EthersProjectWordLists",
        },
      },
    },
  },
  esbuild: {
    pure: process.env.NODE_ENV === "production" ? ["console.log"] : [],
  },
})
