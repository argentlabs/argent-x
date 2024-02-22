const path = require("path")
const fs = require("fs")
const HtmlWebPackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const {
  DefinePlugin,
  ProvidePlugin,
  SourceMapDevToolPlugin,
} = require("webpack")
const DotenvWebPack = require("dotenv-webpack")
const dotenv = require("dotenv")
const { EsbuildPlugin } = require("esbuild-loader")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const manifestV2 = require("./manifest/v2.json")
const manifestV3 = require("./manifest/v3.json")

const htmlPlugin = new HtmlWebPackPlugin({
  template: "./src/ui/index.html",
  filename: "./index.html",
  excludeChunks: ["inject", "inpage", "background"],
})

const isProd = process.env.NODE_ENV === "production"
const useManifestV2 = process.env.MANIFEST_VERSION === "v2"
const safeEnvVars = process.env.SAFE_ENV_VARS === "true"
function safeGetCommitHash() {
  const dotenvPath = path.resolve(__dirname, ".env")
  if (fs.existsSync(dotenvPath)) {
    const dotenvRaw = fs.readFileSync(dotenvPath, "utf8")
    const config = dotenv.parse(dotenvRaw)
    if ("COMMIT_HASH_OVERRIDE" in config) {
      return config.COMMIT_HASH_OVERRIDE
    }
  }
  try {
    const hash = require("child_process").execSync("git rev-parse HEAD")
    return hash.toString().trim()
  } catch (e) {
    return "unknown"
  }
}
const commitHash = safeGetCommitHash()

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
          target: "es2020",
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
          from: `./manifest/${!useManifestV2 ? "v3" : "v2"}.json`,
          to: "manifest.json",
        },
        { from: "./src/assets", to: "assets" },
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
  ].filter(Boolean),
  devtool: isProd ? false : "inline-cheap-module-source-map",
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
            target: "es2020",
            drop: ["console"],
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
  },
}
