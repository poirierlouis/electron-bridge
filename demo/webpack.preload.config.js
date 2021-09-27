const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/electron.preload.ts',
    output: {
        filename: 'src/electron.preload.js',
        path: path.resolve(__dirname)
    },
    target: 'electron-preload',
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
