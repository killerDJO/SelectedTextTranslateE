const fs = require("fs");
const path = require("path");
var spawn = require('child_process').spawn;

const nativeExtensionsPath = "src/main/native-extensions";

const gypProcess = runNodeGyp();
gypProcess.on("exit", code => {
    if (code === 0) {
        copyBindingToDist();
    }
});

function runNodeGyp() {
    const electronVersion = require("../package.json").devDependencies.electron;
    const electronHeadersUrl = "https://atom.io/download/electron";

    const gypProcess = spawn('npx', ["node-gyp", "rebuild", `--target=${electronVersion}`, `--dist-url=${electronHeadersUrl}`, `--directory=${nativeExtensionsPath}`], { shell: true });
    gypProcess.stdout.pipe(process.stdout);
    gypProcess.stderr.pipe(process.stderr);
    return gypProcess;
}

function copyBindingToDist() {
    const fileName = "native-extensions.node";
    const bindingPath = path.join(nativeExtensionsPath, "build/Release", fileName);
    const distPath = path.join("dist/app/native", fileName);
    fs.createReadStream(bindingPath).pipe(fs.createWriteStream(distPath));
    console.log(`Generated binding copied to the ${distPath}`);
}