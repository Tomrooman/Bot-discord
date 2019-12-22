const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");
const config = require('./../config.json')

module.exports = {
    output: {
        publicPath: '/',
        filename: 'bundle.js',
        path: path.resolve(__dirname, '')
    },
    devServer: {
        historyApiFallback: true,
        https: true,
        proxy: {
            "/api": {
                target: config.API.URL,
                pathRewrite: { "^/api": "" },
                changeOrigin: true,
                secure: false
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                options: {
                    presets: [
                        '@babel/preset-env',
                        '@babel/preset-react',
                    ]
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    }
                ]
            },
            {
                test: /\.(png|jp(e*)g|svg)$/,
                use: [{
                    loader: 'url-loader'
                }]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "index.html"
        })
    ]
};