const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const preloadConfig = {
    mode: 'development',
    target: 'electron-preload',
    entry: './electron.preload.ts',
    output: {
        filename: 'electron.preload.js',
        library: {
            name: 'demo-preload',
            type: 'umd'
        },
        path: path.resolve(__dirname)
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    }
};

const rendererConfig = {
    watch: true,
    mode: 'development',
    target: 'electron-renderer',
    entry: './src/index.ts',
    output: {
        filename: 'index.js',
        library: {
            name: 'demo-renderer',
            type: 'umd'
        },
        path: path.resolve(__dirname, 'dist/')
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'index.html'),
                    to: path.resolve(__dirname, 'dist/')
                }
            ]
        })
    ]
};

module.exports = [preloadConfig, rendererConfig];
