const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const package = require("../package.json");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const destinationPath = path.resolve(__dirname, "../dist/app/main");

module.exports = (env, argv) => {
    const isProduction = argv.mode === "production";
    const config = {
        entry: path.resolve(__dirname, "../src/main/app.ts"),
        output: {
            path: destinationPath,
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
                {
                    test: /\.node$/,
                    use: 'native-ext-loader'
                }
            ]
        },
        target: "electron-main",
        node: false,
        resolve: {
            extensions: [".ts", ".js"],
            plugins: [
                new TsconfigPathsPlugin({ configFile: "./src/main/tsconfig.json" })
            ]
        },
        externals: [...Object.keys(package.devDependencies)],
        plugins: [
            new CleanWebpackPlugin({
                cleanStaleWebpackAssets: false
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, "../src/main/presentation/icons"),
                        to: "./icons"
                    },
                ]
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, "../src/main/default-settings.json"),
                        to: "./"
                    },
                    {
                        from: path.resolve(__dirname, "../src/main/languages.json"),
                        to: "./"
                    },
                ]
            }),
            new webpack.NoEmitOnErrorsPlugin()
        ]
    };

    if (isProduction) {
        config.devtool = false;
    }
    else {
        config.devtool = "inline-source-map";
    }

    return config;
}