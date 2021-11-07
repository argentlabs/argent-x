const path = require("path")
const HtmlWebPackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")

const htmlPlugin = new HtmlWebPackPlugin({
  template: "./src/index.html",
  filename: "./index.html",
})

module.exports = {
  entry: {
    main: "./src/index",
    inject: "./src/inject",
    inpage: "./src/inpage",
  },
  devtool: "inline-source-map",
  mode: "development",
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
        { from: "./src/favicon.ico", to: "favicon.ico" },
        { from: "./src/manifest.json", to: "manifest.json" },
        { from: "./src/assets", to: "assets" },
      ],
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
}
