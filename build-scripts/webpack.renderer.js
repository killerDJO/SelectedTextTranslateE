const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = env => {
    const isProduction = env.NODE_ENV === "production";
    const destinationPath = "../dist/renderer";
    const rendererPath = "../src/renderer";

    const scssFrameworkFile = path.resolve(__dirname, rendererPath, "framework/framework.scss");
    const extractSass = new ExtractTextPlugin({
        filename: "styles.css"
    });

    const config = {
        entry: path.resolve(__dirname, rendererPath, "index.ts"),
        output: {
            path: path.resolve(__dirname, destinationPath),
            filename: "[name].build.js",
            libraryTarget: "commonjs2"
        },
        module: {
            rules: [

                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                    options: {
                        appendTsSuffixTo: [/\.vue$/]
                    },
                    exclude: /node_modules/
                },
                {
                    test: /\.vue$/,
                    loader: "vue-loader",
                    options: {
                        loaders: {
                            ts: "ts-loader",
                            scss: extractSass.extract({
                                use: [
                                    {
                                        loader: 'css-loader',
                                        options: {
                                            minimize: isProduction,
                                            sourceMap: true
                                        }
                                    },
                                    {
                                        loader: "sass-loader",
                                        options: {
                                            sourceMap: true,
                                            includePaths: [path.resolve(__dirname, rendererPath)]
                                        }
                                    },
                                    {
                                        loader: 'sass-resources-loader',
                                        options: {
                                            resources: scssFrameworkFile
                                        }
                                    }],
                                fallback: 'vue-style-loader'
                            })
                        }
                    }
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
                }
            ]
        },
        resolve: {
            extensions: [".ts", ".js"],
            plugins: [
                new TsconfigPathsPlugin()
            ]
        },
        devServer: {
            contentBase: "./dist"
        },
        externals: ["electron"],
        plugins: [
            extractSass,
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
            new webpack.DefinePlugin({
                "process.env.NODE_ENV": `"${env.NODE_ENV}"`
            }),
            new webpack.NoEmitOnErrorsPlugin()
        ]
    };

    if (!isProduction) {
        config.devtool = "inline-source-map";
        config.plugins.push(
            new webpack.optimize.CommonsChunkPlugin({
                name: "vendor",
                minChunks: (m) => /node_modules/.test(m.context)
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: "manifest",
                minChunks: Infinity
            }),
            new webpack.NamedModulesPlugin()
        )
    }
    else {
        config.devtool = "source-map";
        config.plugins.push(
            new UglifyJsPlugin({
                sourceMap: true
            })
        )
    }

    return config;
}