const packager = require('electron-packager');
const path = require('path');
const del = require('del');

const packageConfig = {
    arch: 'x64',
    asar: true,
    dir: path.join(__dirname, '../'),
    icon: path.join(__dirname, '../dist/app/main/icons/tray.ico'),
    ignore: pathsFilter,
    out: path.join(__dirname, '../dist/package'),
    overwrite: true,
    platform: 'win32'
}

clean();
package();

function package() {
    packager(packageConfig)
        .then(() => {
            console.log(`App has been packaged.`);
        })
        .catch(reason => {
            console.log(`\n${console.log('`electron-packager`')} says...\n`)
            console.log(reason + '\n')
        });
}

function clean() {
    console.log(packageConfig.out);
    del.sync([packageConfig.out]);
    console.log(`\n${packageConfig.out} has been cleaned.\n`)
}

function pathsFilter(currentPath) {
    const whiteListedPaths = ["", "/dist", "/package.json"];
    for (const whiteListedPath of whiteListedPaths) {
        if (currentPath === whiteListedPath) {
            return false;
        }
    }

    const blacklistedExtensions = [".gitkeep"];
    for (const blacklistedExtension of blacklistedExtensions) {
        if (currentPath.endsWith(blacklistedExtension)) {
            return true;
        }
    }

    return !currentPath.startsWith("/dist/app");
}