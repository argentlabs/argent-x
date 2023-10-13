import type { Configuration } from "webpack"
import DotenvWebPack from "dotenv-webpack"
import path from "path"

export default {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-actions",
    {
      name: "@storybook/addon-essentials",
      options: {
        actions:
          false /** disable mock functions in props, which break component checks for undefined */,
      },
    },
    "@storybook/addon-interactions",
    // "@chakra-ui/storybook-addon", /** TODO: Color mode toggle currently broken - reinstate when fixed https://github.com/chakra-ui/chakra-ui/issues/6855 */
    "storybook-addon-swc",
    "@storybook/addon-mdx-gfm",
  ],

  features: {
    emotionAlias: false,
  },

  framework: {
    name: "@storybook/nextjs",
    options: {},
  },

  core: {
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
      if (rule && rule !== "..." && rule?.test instanceof RegExp) {
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

    /**
     * Use .env file from extension package
     */
    config.plugins = [
      ...(config.plugins || []),
      new DotenvWebPack({
        path: path.resolve(__dirname, "../../extension/.env"),
      }),
    ]

    return config
  },

  staticDirs: ["../../extension/src", "../../ui/assets"],

  docs: {
    autodocs: false,
  },
}
