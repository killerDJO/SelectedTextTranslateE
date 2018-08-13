import { app } from "electron";
import childProcess = require("child_process");
import path = require("path");
import { injectable } from "inversify";

import { Logger } from "infrastructure/Logger";

@injectable()
export class Installer {
    private static readonly OneSecondTimeout: number = 1000;

    private readonly appFolder = path.resolve(process.execPath, "..");
    private readonly exeName = path.basename(process.execPath);
    private readonly updateExe = path.resolve(path.join(this.appFolder, "..", "Update.exe"));

    constructor(private readonly logger: Logger) {
    }

    public handleSquirrelEvent(): boolean {
        if (process.argv.length === 1) {
            return false;
        }

        const squirrelEvent = process.argv[1];

        this.logger.info(`Installer: handling ${squirrelEvent}.`);

        switch (squirrelEvent) {
            case "--squirrel-install":
            case "--squirrel-updated":
                this.handleInstallAndUpdate();
                return true;

            case "--squirrel-uninstall":
                this.handleUninstall();
                return true;

            case "--squirrel-obsolete":
                this.handleObsolete();
                return true;

            default:
                return false;
        }
    }

    private handleInstallAndUpdate(): void {
        this.configureStartup(true);
        this.spawnUpdate(["--createShortcut", this.exeName, this.getShortcutLocations()]);
        this.quit(Installer.OneSecondTimeout);
    }

    private handleUninstall(): void {
        this.configureStartup(false);
        this.spawnUpdate(["--removeShortcut", this.exeName, this.getShortcutLocations()]);
        this.quit(Installer.OneSecondTimeout);
    }

    private getShortcutLocations(): string {
        return "--shortcut-locations=StartMenu";
    }

    private handleObsolete(): void {
        this.quit();
    }

    private configureStartup(enable: boolean) {
        app.setLoginItemSettings({
            openAtLogin: enable,
            path: this.updateExe,
            args: [
                "--processStart", `"${this.exeName}"`,
                "--process-start-args", '"--hidden"'
            ]
        });
    }

    private spawn(command: string, args: string[]): void {
        this.logger.info(`Spawning child process ${command} with arguments: ${args.join(" ")}`);
        try {
            childProcess.spawn(command, args, { detached: true });
        } catch (error) {
            this.logger.error("Error spawning child process", error);
        }
    }

    private spawnUpdate(args: string[]): void {
        return this.spawn(this.updateExe, args);
    }

    private quit(timeout: number = 0): void {
        setTimeout(app.quit, timeout);
    }
}