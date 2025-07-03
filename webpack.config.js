const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
    // Режим сборки: 'development' для разработки, 'production' для продакшена
    mode: 'development', // Или 'production'

    // Точки входа: каждая страница имеет свою точку входа
    entry: {
        index: './src/js/index.js',
        product: './src/js/product.js',
    },

    // Выходные файлы
    output: {
        filename: '[name].[contenthash].js', // [name] будет заменен на 'index' или 'about'
        path: path.resolve(__dirname, 'dist'), // Выходная папка
        publicPath: '/', // Базовый путь для всех ассетов
    },

    // Лоадеры для обработки разных типов файлов
    module: {
        rules: [
            {
                test: /\.css$/, // Применяем этот лоадер для файлов .css
                use: [
                    MiniCssExtractPlugin.loader, // Извлекает CSS в отдельные файлы
                    'css-loader' // Интерпретирует @import и url() как require/import
                ],
            },
        ],
    },

    // Плагины
    plugins: [
        // Очищает папку 'dist' перед каждой сборкой
        new CleanWebpackPlugin(),

        // Генерирует HTML для index.html
        new HtmlWebpackPlugin({
            template: './public/index.html', // Шаблон HTML
            filename: 'index.html',           // Имя выходного HTML файла
            chunks: ['index'],                // Подключает только бандл 'index'
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                useShortDoctype: true
            }
        }),

        // Генерирует HTML для about.html
        new HtmlWebpackPlugin({
            template: './public/product.html',  // Шаблон HTML
            filename: 'product.html',           // Имя выходного HTML файла
            chunks: ['product'],                // Подключает только бандл 'about'
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                useShortDoctype: true
            }
        }),

        // Извлекает CSS в отдельные файлы
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
    ],

    // Оптимизация (для production-режима)
    optimization: {
        minimizer: [
            new CssMinimizerPlugin(), // Минифицирует CSS
        ],
        // Опционально: разделение кода для общих зависимостей
        splitChunks: {
            chunks: 'all',
            // Например, для создания общего vendor-бандла
            // name: (module, chunks, cacheGroupKey) => {
            //     const allChunksNames = chunks.map((item) => item.name).join('-');
            //     return `${cacheGroupKey}-${allChunksNames}`;
            // },
        },
    },

    // DevServer (опционально, для удобства разработки)
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
        open: true, // Открывать браузер автоматически
        historyApiFallback: {
            rewrites: [
                { from: /^\/about/, to: '/product.html' },
                { from: /./, to: '/index.html' }, // Это для того, чтобы / попал на index.html
            ]
        }
    },
};