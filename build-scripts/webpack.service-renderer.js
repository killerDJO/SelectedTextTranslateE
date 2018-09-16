const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === "production";
    const destinationPath = "../dist/app/service-renderer";
    const rendererPath = "../src/service-renderer";

    const config = {
        entry: path.resolve(__dirname, rendererPath, "index.ts"),
        output: {
            path: path.resolve(__dirname, destinationPath),
            filename: "[name].build.js",
            libraryTarget: "commonjs2"
        },
        node: false,
        target: "electron-renderer",
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: [".ts", ".js"],
            plugins: [
                new TsconfigPathsPlugin({ configFile: "./src/service-renderer/tsconfig.json" })
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, rendererPath, "index.html")
            }),
            new CleanWebpackPlugin(
                [
                    path.resolve(__dirname, destinationPath)
                ],
                {
                    allowExternal: true
                }),
            new webpack.NoEmitOnErrorsPlugin()
        ],
        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/](node_modules)[\\/]/,
                        name: "vendors",
                        chunks: "all"
                    }
                }
            }
        }
    };

    if (!isProduction) {
        config.devtool = "inline-source-map";
    }
    else {
        config.devtool = false;
    }

    return config;
}