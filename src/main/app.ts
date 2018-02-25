import { app, BrowserWindow } from "electron";
import * as path from "path";

import { Application } from "main/presentation/Application";
import { container } from "main/inversify.config";

let application: Application;
app.on("ready", () => {
    application = container.get<Application>(Application);
});