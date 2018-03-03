import { app, BrowserWindow } from "electron";
import * as path from "path";

import { Application } from "main/presentation/Application";
import { container } from "main/inversify.config";
import { DevToolsLoader } from "main/presentation/framework/DevToolsLoader";

let application: Application;
app.on("ready", async () => {
    await DevToolsLoader.load();
    application = container.get<Application>(Application);
});