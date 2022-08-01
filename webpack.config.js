const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const vtkRules = require("vtk.js/Utilities/config/dependency.js").webpack.core
  .rules;

const entry = path.join(__dirname, "./src/index.js");
const outputPath = path.join(__dirname, "./dist");

module.exports = {
  node: {
    fs: "empty",
  },
  entry,
  output: {
    path: outputPath,
    filename: "index.js",
  },
  mode: "development",
  module: {
    rules: [
      { test: entry, loader: "expose-loader?index" },
      { test: /\.js$/, loader: "babel-loader" },
      { test: /\.html$/, loader: "html-loader" },
      { test: /\.css$/i, use: ["style-loader", "css-loader"] },
    ].concat(vtkRules),
  },
  plugins: [
    new CopyPlugin([
      {
        from: path.join(__dirname, "node_modules", "itk", "WebWorkers"),
        to: path.join(__dirname, "dist", "itk", "WebWorkers"),
      },
      {
        from: path.join(__dirname, "node_modules", "itk", "ImageIOs"),
        to: path.join(__dirname, "dist", "itk", "ImageIOs"),
      },
      {
        from: path.join(__dirname, "node_modules", "itk", "MeshIOs"),
        to: path.join(__dirname, "dist", "itk", "MeshIOs"),
      },
    ]),
  ],
  performance: {
    maxAssetSize: 10000000,
  },
};
