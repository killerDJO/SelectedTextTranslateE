const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === "production";
    const config = {
        entry: path.resolve(__dirname, "../src/main/app.ts"),
        output: {
            path: path.resolve(__dirname, "../dist/main"),
            filename: "[name].build.js",
            libraryTarget: "commonjs2"
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                    exclude: /node_modules/,
                }
            ]
        },
        node: false,
        resolve: {
            extensions: [".ts"],
            plugins: [
                new TsconfigPathsPlugin({ configFile: "./src/main/tsconfig.json" })
            ]
        },
        optimization: {
            minimize: false
        },
        externals: [nodeExternals()],
        plugins: [
            new CleanWebpackPlugin(
                [
                    path.resolve(__dirname, "../dist/main")
                ],
                {
                    allowExternal: true
                }),
            new CopyWebpackPlugin([
                {
                    from: path.resolve(__dirname, "../src/main/presentation/icons"),
                    to: "./icons"
                },
            ]),
            new webpack.NoEmitOnErrorsPlugin()
        ]
    };

    if (isProduction) {
        config.devtool = "source-map";
    }
    else {
        config.devtool = "inline-source-map";
    }

    return config;
}