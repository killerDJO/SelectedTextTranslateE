const packageConfig = require('./package.config');
const packager = require('electron-packager');
const del = require('del');

clean();
package();

function package() {
    packager(packageConfig)
        .then(() => {
            console.log(`App has been packaged.`);
        })
        .catch(reason => {
            console.log(`\n${chalk.yellow('`electron-packager`')} says...\n`)
            console.log(reason + '\n')
        });
}

function clean() {
    console.log(packageConfig.out);
    del.sync([packageConfig.out]);
    console.log(`\n${packageConfig.out} has been cleaned.\n`)
}