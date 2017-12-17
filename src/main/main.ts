import { app, BrowserWindow, Menu, Tray } from "electron";
import * as path from "path";
import * as url from "url";
import icon from "./assets/SelectedTextTranslate.ico";

let win: BrowserWindow | null;

const baseUrl = process.env.NODE_ENV === "dev"
    ? "http://localhost:8080"
    : `file:${path.resolve(__dirname, "..\\renderer\\index.html")}`;

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

    win.loadURL(baseUrl);

    //createTaskBar();

    win.on("closed", () => {
        win = null;
    });
}

function createTaskBar(): void {
    console.log(icon);
    const iconPath = path.join(__dirname, icon);
    const tray = new Tray(iconPath);
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
