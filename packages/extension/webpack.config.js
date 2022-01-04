const path = require("path")
const HtmlWebPackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const { DefinePlugin } = require("webpack")

const htmlPlugin = new HtmlWebPackPlugin({
  template: "./src/ui/index.html",
  filename: "./index.html",
  excludeChunks: ["inject", "inpage", "background"],
})

const isProd = process.env.NODE_ENV === "production"

module.exports = {
  entry: {
    main: "./src/ui",
    inject: "./src/content",
    inpage: "./src/inpage",
    background: "./src/background",
  },
  devtool: "inline-source-map",
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
        test: /\.(png|jpg|gif)$/i,
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
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    htmlPlugin,
    new CopyPlugin({
      patterns: [
        { from: "./src/ui/favicon.ico", to: "favicon.ico" },
        { from: "./src/manifest.json", to: "manifest.json" },
        { from: "./src/assets", to: "assets" },
      ],
    }),
    new DefinePlugin({
      "process.env.VERSION": JSON.stringify(process.env.npm_package_version),
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@mui/styled-engine": "@mui/styled-engine-sc",
    },
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
}
