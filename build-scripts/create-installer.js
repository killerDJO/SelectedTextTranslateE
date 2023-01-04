const electronInstaller = require('electron-winstaller');
const path = require('path');
const rimraf = require('rimraf');

const platformAndArch = `${process.platform}-${process.arch}`;

const installerConfig = {
  appDirectory: path.join(__dirname, `../dist/package/Selected Text Translate-${platformAndArch}`),
  outputDirectory: path.join(__dirname, '../dist/installer'),
  exe: 'Selected Text Translate.exe',
  title: `Selected Text Translate Setup`,
  setupExe: `Selected Text Translate Setup.exe`,
  iconUrl: path.join(__dirname, '../dist/app/main/presentation/icons/tray.ico'),
  noMsi: true
};

clean();
createInstaller();

function createInstaller() {
  resultPromise = electronInstaller.createWindowsInstaller(installerConfig);

  resultPromise.then(
    () => console.log('Installer has been created.'),
    e => console.log(`Error creating installer: ${e.message}`)
  );
}

function clean() {
  rimraf.sync(installerConfig.outputDirectory, { recursive: true, force: true });
  console.log(`\n${installerConfig.outputDirectory} has been cleaned.\n`);
}
