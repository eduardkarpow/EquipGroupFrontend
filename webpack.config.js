const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
    mode: 'development',

    entry: {
        index: './src/js/index.js',
        product: './src/js/product.js',
    },

    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ],
            },
        ],
    },

    plugins: [
        new CleanWebpackPlugin(),

        new HtmlWebpackPlugin({
            template: './public/index.html', 
            filename: 'index.html',          
            chunks: ['index'],               
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                useShortDoctype: true
            }
        }),

        new HtmlWebpackPlugin({
            template: './public/product.html', 
            filename: 'product.html',          
            chunks: ['product'],              
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                useShortDoctype: true
            }
        }),

        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
    ],

    optimization: {
        minimizer: [
            new CssMinimizerPlugin(),
        ],
        splitChunks: {
            chunks: 'all',
        },
    },

    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
        open: true,
        historyApiFallback: {
            rewrites: [
                { from: /^\/about/, to: '/product.html' },
                { from: /./, to: '/index.html' },
            ]
        }
    },
};