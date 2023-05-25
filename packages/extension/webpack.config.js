const path = require("path")
const HtmlWebPackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const { DefinePlugin, ProvidePlugin } = require("webpack")
const Dotenv = require("dotenv-webpack")
const { EsbuildPlugin } = require("esbuild-loader")

const ESLintPlugin = require("eslint-webpack-plugin")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const SentryWebpackPlugin = require("@sentry/webpack-plugin")
const manifestV2 = require("./manifest/v2.json")
const manifestV3 = require("./manifest/v3.json")

const htmlPlugin = new HtmlWebPackPlugin({
  template: "./src/ui/index.html",
  filename: "./index.html",
  excludeChunks: ["inject", "inpage", "background"],
})

const isProd = process.env.NODE_ENV === "production"
const useManifestV3 = process.env.MANIFEST_VERSION === "v3"
const safeEnvVars = process.env.SAFE_ENV_VARS === "true"

if (safeEnvVars) {
  console.log("Safe env vars enabled")
}

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: {
    main: "./src/ui",
    inject: "./src/content",
    inpage: "./src/inpage",
    background: "./src/background",
  },
  performance: {
    hints: false,
  },
  devtool: isProd ? "source-map" : "inline-source-map",
  mode: isProd ? "production" : "development",
  module: {
    rules: [
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
        loader: "esbuild-loader",
        options: {
          pure: isProd ? ["console.log"] : [],
        },
      },
    ],
  },
  plugins: [
    htmlPlugin,
    new CopyPlugin({
      patterns: [
        { from: "./src/ui/favicon.ico", to: "favicon.ico" },
        {
          from: `./manifest/${useManifestV3 ? "v3" : "v2"}.json`,
          to: "manifest.json",
        },
        { from: "./src/assets", to: "assets" },
      ],
    }),
    new DefinePlugin({
      "process.env.VERSION": JSON.stringify(
        useManifestV3 ? manifestV3.version : manifestV2.version, // doesn't matter much, but why not
      ),
    }),
    new ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      React: "react",
    }),

    !isProd && // eslint should run before the build starts
      new ESLintPlugin({
        extensions: ["ts", "tsx"],
        fix: true,
        threads: true,
      }),

    new ForkTsCheckerWebpackPlugin(), // does the type checking in a separate process (non-blocking in dev) as esbuild is skipping type checking

    new Dotenv({
      systemvars: true,
      safe: safeEnvVars,
    }),
  ].filter(Boolean),
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: { buffer: require.resolve("buffer/") },
    alias: {
      "@mui/styled-engine": "@mui/styled-engine-sc",
    },
  },
  optimization: isProd
    ? {
        minimize: true,
        minimizer: [
          new EsbuildPlugin({
            loader: "tsx",
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
    sourceMapFilename: "../sourcemaps/[file].map",
  },
}
