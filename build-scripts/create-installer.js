const electronInstaller = require("electron-winstaller");
const path = require("path");
const del = require("del");

const installerConfig = {
    appDirectory: path.join(__dirname, "../dist/package/Selected Text Translate-win32-x64"),
    outputDirectory: path.join(__dirname, "../dist/installer"),
    exe: "Selected Text Translate.exe",
    setupExe: "Selected Text Translate Setup.exe",
    iconUrl: path.join(__dirname, "../dist/app/main/icons/tray.ico"),
    noMsi: true
};

clean();
createInstaller();

function createInstaller() {
    resultPromise = electronInstaller.createWindowsInstaller(installerConfig);

    resultPromise.then(
        () => console.log("Installer has been created."),
        (e) => console.log(`Error creating installer: ${e.message}`));
}

function clean() {
    del.sync([installerConfig.outputDirectory]);
    console.log(`\n${installerConfig.outputDirectory} has been cleaned.\n`)
}