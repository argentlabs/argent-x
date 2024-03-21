import type { Configuration } from "webpack"
import DotenvWebPack from "dotenv-webpack"
import path from "path"
import type { StorybookConfig } from "@storybook/nextjs"

export const isCI = Boolean(process.env.CI)

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-addon-swc",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: false,
  },
  refs: {
    "@chakra-ui/react": {
      disable: true,
    },
    "@argent/x-ui": {
      title: "Argent Design System",
      url: "https://develop--65d8cb036305ac44c7a097eb.chromatic.com/",
    },
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
        "webextension-polyfill": path.resolve(
          __dirname,
          "./webextension-polyfill-mock.ts",
        ),
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
    config.plugins = [
      ...(config.plugins || []),
      new DotenvWebPack(
        isCI
          ? {
              /** Use env vars defined in CI */
              systemvars: true,
            }
          : {
              /** Use .env file from extension package */
              path: path.resolve(__dirname, "../../extension/.env"),
            },
      ),
    ]

    return config
  },
  staticDirs: ["../../extension/src"],
}

export default config
