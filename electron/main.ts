import { app, BrowserWindow, Menu, Tray } from "electron";
import * as path from "path";
import * as url from "url";

let win: BrowserWindow | null;

app.on("ready", createWindow);

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1800,
        height: 600,
        frame: true,
        focusable: true,
        skipTaskbar: false,
        alwaysOnTop: false,
        thickFrame: true,
        show: true
    });

    // win.on("blur", () => {
    //     if (win) {
    //         win.hide();
    //     }
    // });

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    createTaskBar();

    win.on("closed", () => {
        win = null;
    });
}

function createTaskBar(): void {
    const tray = new Tray(path.join(__dirname, "assets/SelectedTextTranslate.ico"));
    const contextMenu = Menu.buildFromTemplate([
        { label: "Close", type: "normal", role: "quit" },
    ]);
    tray.setToolTip("This is my application.");
    tray.setContextMenu(contextMenu);
    tray.on("click", () => {
        if (win) {
            win.show();
            win.focus();
        }
    });
}
