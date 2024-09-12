import CopyPlugin from "copy-webpack-plugin"
import DotenvWebPack from "dotenv-webpack"
import { EsbuildPlugin } from "esbuild-loader"
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin"
import HtmlWebPackPlugin from "html-webpack-plugin"
import path from "path"
import webpack, {
  DefinePlugin,
  ProvidePlugin,
  SourceMapDevToolPlugin,
} from "webpack"

import rootPkg from "../../package.json"
import manifestV2 from "./manifest/v2.json"
import manifestV3 from "./manifest/v3.json"

import {
  isProd,
  isDev,
  safeEnvVars,
  useManifestV2,
  useReactDevTools,
  showDevUi,
} from "./build/config"
import { getLocalDevelopmentAttributes } from "./build/getLocalDevelopmentAttributes"
import { getReleaseTrack } from "./build/getReleaseTrack"
import { getSafeGetCommitHash } from "./build/getSafeGetCommitHash"
import { transformManifestJson } from "./build/transformManifestJson"

const releaseTrack = getReleaseTrack()
const { hasLinkedPackageOverrides, sourcemapResourcePaths } =
  getLocalDevelopmentAttributes(rootPkg) || {}
const commitHash = getSafeGetCommitHash()

if (safeEnvVars) {
  console.log("Safe env vars enabled")
}

const htmlPlugin = new HtmlWebPackPlugin({
  title: "Argent X",
  head: useReactDevTools
    ? `<script src="http://localhost:8097"></script>`
    : undefined,
  template: "./src/ui/index.html",
  filename: "./index.html",
  excludeChunks: ["inject", "inpage", "background"],
})

const config: webpack.Configuration = {
  entry: {
    main: "./src/ui",
    inject: "./src/content",
    inpage: "./src/inpage",
    background: "./src/background",
  },
  performance: {
    hints: false,
  },
  mode: isProd ? "production" : "development",
  // suppress errors from `source-map-loader`
  ignoreWarnings: [/Failed to parse source map/],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {},
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|txt)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        use: [
          showDevUi && {
            loader: "babel-loader",
            options: {
              plugins: [
                "jotai/babel/plugin-debug-label", // automatically adds 'debugLabel' to atoms
              ],
            },
          },
          {
            loader: "esbuild-loader",
            options: {
              pure: isProd ? ["console.log", "console.warn"] : [],
              target: "es2020",
            },
          },
        ],
      },
      hasLinkedPackageOverrides && {
        test: /\.(mjs|cjs|js)$/,
        enforce: "pre",
        use: [
          {
            loader: "source-map-loader",
            options: {
              // include source maps only for locally linked packages
              filterSourceMappingUrl: (_url: string, resourcePath: string) => {
                if (
                  sourcemapResourcePaths?.some((sourcemapResourcePath) =>
                    resourcePath.startsWith(sourcemapResourcePath),
                  )
                ) {
                  return true
                }
                return false
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    htmlPlugin,
    new CopyPlugin({
      patterns: [
        {
          from: `./manifest/${!useManifestV2 ? "v3" : "v2"}.json`,
          to: "manifest.json",
          transform: transformManifestJson,
        },
        {
          from: "./src/assets",
          to: "assets",
        },
        {
          from: `./src/ui/appicon/appicon-${releaseTrack}.png`,
          to: "assets/appicon.png",
        },
        {
          from: `./src/ui/appicon/favicon-${releaseTrack}.ico`,
          to: "favicon.ico",
        },
      ],
    }),
    new DefinePlugin({
      "process.env.VERSION": JSON.stringify(
        !useManifestV2 ? manifestV3.version : manifestV2.version, // doesn't matter much, but why not
      ),
      "process.env.COMMIT_HASH": JSON.stringify(commitHash),
    }),
    new ProvidePlugin({
      React: "react",
      Buffer: ["buffer", "Buffer"],
    }),

    isProd &&
      new SourceMapDevToolPlugin({
        filename: "../sourcemaps/[file].map",
        append: `\n//# sourceMappingURL=[file].map`,
      }), // For development, we use the devtool option instead

    new ForkTsCheckerWebpackPlugin(), // does the type checking in a separate process (non-blocking in dev) as esbuild is skipping type checking

    new DotenvWebPack({
      systemvars: true,
      safe: safeEnvVars,
    }),
  ],
  devtool: isProd ? false : "inline-cheap-module-source-map",
  resolve: {
    // for linked local `@argent/...` package overrides, prioritise local node_modules
    // otherwise their peerDependencies will be loaded from linked packages,
    // resulting in duplicate instances of React etc. and some interesting bugs
    modules: hasLinkedPackageOverrides
      ? [path.resolve(__dirname, "node_modules"), "node_modules"]
      : undefined,
    extensions: [".tsx", ".ts", ".js"],
    fallback: { buffer: require.resolve("buffer/") },
    alias: {
      "@mui/styled-engine": "@mui/styled-engine-sc",
      ...(showDevUi
        ? {
            // allow DevUI import
          }
        : {
            // omit DevUI import
            [path.resolve(__dirname, "./src/ui/features/dev/DevUI")]: false,
          }),
    },
  },
  optimization: isProd
    ? {
        minimize: true,
        minimizer: [
          new EsbuildPlugin({
            loader: "tsx",
            target: "es2020",
          }),
        ],
        splitChunks: {
          chunks(chunk) {
            return chunk.name === "main"
          },
        },
      }
    : undefined,
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: isProd,
  },
}

export default config
