const packager = require('electron-packager');
const path = require('path');
const rimraf = require('rimraf');
const fs = require('fs');
const _ = require('lodash');

const packageConfig = {
  arch: 'x64',
  asar: true,
  dir: path.join(__dirname, '../'),
  icon: path.join(__dirname, '../dist/app/main/presentation/icons/tray.ico'),
  ignore: ignorePath,
  afterCopy: [modifySettings, copyCommonPackage],
  executableName: 'Selected Text Translate',
  out: path.join(__dirname, '../dist/package'),
  overwrite: true,
  platform: 'win32',
  prune: true
};

const INTERNAL_MODULE_NAME = '@selected-text-translate';

clean();
package();

function package() {
  packager(packageConfig)
    .then(() => {
      console.log(`App has been packaged.`);
    })
    .catch(reason => {
      console.log(`\nelectron-packager says...\n`);
      console.log(reason + '\n');
    });
}

function clean() {
  rimraf.sync(packageConfig.out, { recursive: true, force: true });
  console.log(`\n${packageConfig.out} has been cleaned.\n`);
}

function ignorePath(currentPath) {
  const whiteListedPaths = ['', '/dist', '/package.json'];
  for (const whiteListedPath of whiteListedPaths) {
    if (currentPath === whiteListedPath) {
      return false;
    }
  }

  return !currentPath.startsWith('/dist/app') && !currentPath.startsWith('/node_modules');
}

function modifySettings(buildPath, electronVersion, platform, arch, callback) {
  const defaultSettingsPath = path.join(buildPath, 'dist/app/main/default-settings.json');
  const productionSettingsPath = path.join(__dirname, 'resources/production-settings.json');
  const defaultSettings = JSON.parse(fs.readFileSync(defaultSettingsPath));
  const productionSettings = JSON.parse(fs.readFileSync(productionSettingsPath));
  const mergedSettings = _.extend(defaultSettings, productionSettings);
  fs.writeFileSync(defaultSettingsPath, JSON.stringify(mergedSettings, null, 4));
  callback();
}

function copyCommonPackage(buildPath, electronVersion, platform, arch, callback) {
  const outputFolder = path.join(buildPath, `node_modules/${INTERNAL_MODULE_NAME}`);
  const sourceFolder = path.join(__dirname, '..', 'packages/common');
  copyFolderRecursiveSync(sourceFolder, outputFolder);
  callback();
}

function copyFileSync(source, target) {
  var targetFile = target;

  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
  var files = [];

  var targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      var curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}
