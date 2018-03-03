const path = require('path');

module.exports = {
    arch: 'x64',
    asar: true,
    dir: path.join(__dirname, '../'),
    //icon: path.join(__dirname, '../build/icons/icon'),
    ignore: /(^\/(src|test|build|\.[a-z]+|README|tsconfig\.json|tslint\.json))|\.gitkeep/,
    out: path.join(__dirname, '../dist/package'),
    overwrite: true,
    platform: 'win32'
}