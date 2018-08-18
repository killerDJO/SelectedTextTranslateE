import { app, powerSaveBlocker } from "electron";
// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";

import { container } from "inversify.config";
import { DevToolsLoader } from "presentation/infrastructure/DevToolsLoader";
import { ErrorHandler } from "infrastructure/ErrorHandler";
import { Logger } from "infrastructure/Logger";
import { Application } from "presentation/Application";
import { Installer } from "install/Installer";

powerSaveBlocker.start('prevent-app-suspension');

const logger = container.get<Logger>(Logger);

if (app.makeSingleInstance(() => undefined)) {
    app.quit();
}

const isDevelopmentRun = process.execPath.endsWith("electron.exe");
if (isDevelopmentRun) {
    app.setAppUserModelId(process.execPath);
}

let application: Application;
app.on("ready", async () => {
    container.get<ErrorHandler>(ErrorHandler).initialize();
    logger.info("Application startup.");

    if (container.get<Installer>(Installer).handleSquirrelEvent()) {
        return;
    }

    await DevToolsLoader.load();
    application = container.get<Application>(Application);
});

app.on("before-quit", () => {
    logger.info("Application shutdown.");
});

app.on("window-all-closed", () => {
    // do not quit
});