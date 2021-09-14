const path = require('path');

const defaultConfig = {
    mode: 'development',
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

const mainConfig = Object.assign({}, defaultConfig, {
    target: 'electron-main',
    entry: './src/main/index.ts',
    output: {
        filename: 'index.js',
        library: {
            name: 'electron-bridge-main',
            type: 'umd'
        },
        path: path.resolve(__dirname, 'dist/main/')
    },
});

const preloadConfig = Object.assign({}, defaultConfig, {
    target: 'electron-preload',
    entry: './src/preload/index.ts',
    output: {
        filename: 'index.js',
        library: {
            name: 'electron-bridge-preload',
            type: 'umd'
        },
        path: path.resolve(__dirname, 'dist/preload/')
    },
});

const rendererConfig = Object.assign({}, defaultConfig, {
    target: 'electron-renderer',
    entry: './src/renderer/index.ts',
    output: {
        filename: 'index.js',
        library: {
            name: 'electron-bridge-renderer',
            type: 'umd'
        },
        path: path.resolve(__dirname, 'dist/renderer/')
    },
});

module.exports = [mainConfig, preloadConfig, rendererConfig];
