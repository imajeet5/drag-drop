const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/app.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  devtool: "inline-source-map",
  rules: [
    {
      test: /\.ts&/,
      use: "ts-loader",
      excludes: /node_modules/
    }
  ],
  resolve: {
    extensions: [".ts", ".js"]
  }
};
