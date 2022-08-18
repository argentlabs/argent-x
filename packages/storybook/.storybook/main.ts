import type { Configuration } from "webpack"

export default {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-addon-swc",
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

    /**
     * Override default Storybook svg loader with svgr
     */
    const fileLoaderRule = config.module?.rules?.find((rule) => {
      if (rule !== "..." && rule?.test instanceof RegExp) {
        return rule.test.test(".svg")
      }
    })
    if (fileLoaderRule && fileLoaderRule !== "...") {
      fileLoaderRule.exclude = /\.svg$/
    }
    config.module = {
      ...(config.module || {}),
      rules: [
        ...(config.module?.rules || []),
        {
          test: /\.svg$/,
          enforce: "pre",
          loader: require.resolve("@svgr/webpack"),
        },
      ],
    }
    return config
  },
  staticDirs: ["../../extension/src"],
}
