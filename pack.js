#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const path = require('path');

async function main() {
    const packageFile = fs.readFileSync('package.json', {encoding: 'utf8', flag: 'r'});
    const packageJson = JSON.parse(packageFile);

    delete packageJson.private;
    delete packageJson.files;
    delete packageJson.scripts;
    delete packageJson.devDependencies;
    fs.writeFileSync('dist/package.json', JSON.stringify(packageJson), {encoding: 'utf8', flag: 'w'});
    fs.copyFileSync('README.md', 'dist/README.md');
    fs.copyFileSync('LICENSE', 'dist/LICENSE');

    if (fs.existsSync('dist/schemas')) {
        fs.rmSync('dist/schemas', {recursive: true, force: true});
    }

    if (!fs.existsSync('dist/src')) {
        return;
    }
    const sections = ["main", "preload", "renderer"];

    for (const section of sections) {
        const files = await glob(`dist/src/${section}/*.ts`);

        files.forEach((file) => {
            fs.renameSync(file, path.join(`dist/${section}`, path.basename(file)));
        });
    }
    const files = await glob('dist/src/*.ts');

    files.forEach((file) => {
        fs.renameSync(file, path.join(`dist`, path.basename(file)));
    });

    fs.rmSync('dist/src', {recursive: true, force: true});
}

(async () => {
    await main();
})();
