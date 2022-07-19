import type { Configuration } from "webpack"

export default {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-webpack5",
    disableTelemetry: true,
  },
  webpackFinal: async (config: Configuration) => {
    /**
     * Use Mui with styled-components
     * @see https://mui.com/material-ui/guides/styled-engine/
     */
    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias || {}),
        "@mui/styled-engine": "@mui/styled-engine-sc",
      },
    }
    return config
  },
  staticDirs: ["../../extension/src"],
}
