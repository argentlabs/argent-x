import { resolve as resolvePath } from "path"

import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import { defineConfig } from "vitest/config"

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
  test: {
    globals: true,
    setupFiles: "test/setup.ts",
    environment: "jsdom",
    testTimeout: 50 * 60 * 1000,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      "**/.{idea,git,cache,output,temp}/**",
    ],
    coverage: {
      exclude: [
        "**/*.mock.ts",
        "**/setup.ts",
        "**/*.json",
        "**/*.config.{js,ts}",
        "test{,s}/**",
        "test{,-*}.{js,cjs,mjs,ts,tsx,jsx}",
        "**/*.d.ts",
      ],
      reportsDirectory: "./coverage",
      excludeNodeModules: true,
      reporter: ["text", "lcov"],
      all: true,
    },
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
