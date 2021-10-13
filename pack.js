#!/usr/bin/env node

const fs = require('fs');

function main() {
    const packageFile = fs.readFileSync('package.json', {encoding: 'utf8', flag: 'r'});
    const packageJson = JSON.parse(packageFile);

    delete packageJson.private;
    delete packageJson.files;
    delete packageJson.scripts;
    delete packageJson.devDependencies;
    fs.writeFileSync('dist/package.json', JSON.stringify(packageJson), {encoding: 'utf8', flag: 'w'});
    fs.copyFileSync('README.md', 'dist/README.md');
    fs.copyFileSync('LICENSE', 'dist/LICENSE');
}

main();
