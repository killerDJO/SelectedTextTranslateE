const electronInstaller = require('electron-winstaller');
const path = require('path');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: path.join(__dirname, '../dist/package/SelectedTextTranslate-win32-x64'),
    outputDirectory: path.join(__dirname, '../dist/installer'),
    exe: 'SelectedTextTranslate.exe'
});

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));