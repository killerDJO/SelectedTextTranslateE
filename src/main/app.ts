import { app, BrowserWindow, Notification, dialog } from "electron";
import * as path from "path";
// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";

import { Application } from "presentation/Application";
import { container } from "inversify.config";
import { DevToolsLoader } from "presentation/infrastructure/DevToolsLoader";
import { ErrorHandler } from "infrastructure/ErrorHandler";

let application: Application;
app.on("ready", async () => {
    container.get<ErrorHandler>(ErrorHandler).initialize();
    await DevToolsLoader.load();
    application = container.get<Application>(Application);
});