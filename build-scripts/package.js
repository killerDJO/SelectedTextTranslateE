const packageConfig = require('./package.config');
const packager = require('electron-packager');
const chalk = require('chalk');
const del = require('del');

clean();
package();

function package() {
    packager(packageConfig, (err, appPaths) => {
        if (err) {
            console.log(`\n${chalk.yellow('`electron-packager`')} says...\n`)
            console.log(err + '\n')
        } else {
            console.log(`App has been packaged.`)
        }
    })
}

function clean() {
    console.log(packageConfig.out);
    del.sync([packageConfig.out]);
    console.log(`\n${packageConfig.out} has been cleaned.\n`)
}