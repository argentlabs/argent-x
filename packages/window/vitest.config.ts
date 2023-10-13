import { mergeConfig } from "vitest/config"

import viteConfig from "./vite.config"

export default mergeConfig(viteConfig, {
  test: {
    environment: "happy-dom",
    exclude: ["**/node_modules/**", "**/*.mock.ts"],
    coverage: {
      exclude: ["**/node_modules/**", "**/*.mock.ts"],
    },
  },
})
