import { app, BrowserWindow } from "electron";
import * as path from "path";

// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";

import { Application } from "main/presentation/Application";
import { container } from "main/inversify.config";
import { DevToolsLoader } from "main/presentation/infrastructure/DevToolsLoader";

let application: Application;
app.on("ready", async () => {
    await DevToolsLoader.load();
    application = container.get<Application>(Application);
});