const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = env => {
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
                },

            ]
        },
        node: {
            __dirname: false
        },
        resolve: {
            extensions: [".ts"],
            plugins: [
                new TsconfigPathsPlugin()
            ]
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
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.DefinePlugin({
                "process.env.NODE_ENV": `"${env.NODE_ENV}"`
            })
        ]
    };

    if (env.NODE_ENV === "dev") {
        config.devtool = "inline-source-map";
    }
    else if (env.NODE_ENV === "prod") {
        config.devtool = "source-map";
        config.plugins.push(
            new UglifyJsPlugin({
                sourceMap: true
            })
        )
    }

    return config;
}