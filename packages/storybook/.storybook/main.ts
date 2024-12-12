import type { Configuration } from "webpack"
import DotenvWebPack from "dotenv-webpack"
import path from "path"
import type { StorybookConfig } from "@storybook/nextjs"

import rootPkg from "../../../package.json"
import { getLocalDevelopmentAttributes } from "../../extension/build/getLocalDevelopmentAttributes"

export const isCI = Boolean(process.env.CI)

const { hasLinkedPackageOverrides } =
  getLocalDevelopmentAttributes(rootPkg) || {}

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
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
    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias || {}),
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
    if (hasLinkedPackageOverrides) {
      // for linked local `@argent/...` package overrides, prioritise local node_modules
      // otherwise their peerDependencies will be loaded from linked packages,
      // resulting in duplicate instances of React etc. and some interesting bugs
      config.resolve.modules = [
        path.resolve(__dirname, "../node_modules"),
        "node_modules",
      ].concat(config.resolve?.modules || [])
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
