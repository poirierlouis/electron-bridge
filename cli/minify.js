#!/usr/bin/env node

const glob = require('glob-promise');
const minify = require('@node-minify/core');
const UglifyEs = require('@node-minify/uglify-es');

async function main() {
    const files = await glob("./dist/**/*.js");

    await Promise.all(files.map((file) => {
        return minify({
            compressor: UglifyEs,
            input: file,
            output: file
        });
    }));
}

(async () => {
    await main();
})();
