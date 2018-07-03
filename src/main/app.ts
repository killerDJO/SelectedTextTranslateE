import { app, BrowserWindow } from "electron";
import * as path from "path";
// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";

import { Application } from "presentation/Application";
import { container } from "inversify.config";
import { DevToolsLoader } from "presentation/infrastructure/DevToolsLoader";
import { ErrorHandler } from "infrastructure/ErrorHandler";
import { Logger } from "infrastructure/Logger";

app.setAppUserModelId(process.execPath);
const logger = container.get<Logger>(Logger);

let application: Application;
app.on("ready", async () => {
    container.get<ErrorHandler>(ErrorHandler).initialize();
    logger.info("Application startup.");
    await DevToolsLoader.load();
    application = container.get<Application>(Application);
});

app.on("before-quit", () => {
    logger.info("Application shutdown.");
});