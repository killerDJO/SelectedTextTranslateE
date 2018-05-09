const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader')

module.exports = (env, argv) => {
    const isProduction = argv.mode === "production";
    const destinationPath = "../dist/renderer";
    const rendererPath = "../src/renderer";

    const scssFrameworkFile = path.resolve(__dirname, rendererPath, "framework/framework.scss");

    const config = {
        entry: path.resolve(__dirname, rendererPath, "index.ts"),
        output: {
            path: path.resolve(__dirname, destinationPath),
            filename: "[name].build.js",
            libraryTarget: "commonjs2"
        },
        node: false,
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                    exclude: /node_modules/
                },
                {
                    test: /\.vue$/,
                    loader: "vue-loader",
                },
                {
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    use: {
                        loader: "url-loader",
                        query: {
                            limit: 10000,
                            name: "imgs/[name]--[folder].[ext]"
                        }
                    }
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader',
                        {
                            loader: 'sass-resources-loader',
                            options: {
                                resources: scssFrameworkFile
                            }
                        }
                    ]
                }
            ]
        },
        resolve: {
            extensions: [".ts", ".js"],
            plugins: [
                new TsconfigPathsPlugin({ configFile: "./src/renderer/tsconfig.json" })
            ]
        },
        externals: ["electron"],
        plugins: [
            new VueLoaderPlugin(),
            new MiniCssExtractPlugin({
                filename: "style.css"
            }),
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
                        test: /[\\/]node_modules[\\/]/,
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
        config.devtool = "source-map";
    }

    return config;
}