import { app } from "electron";
import childProcess = require("child_process");
import { injectable } from "inversify";

import { Logger } from "infrastructure/Logger";
import { StartupHandler } from "install/StartupHandler";
import { StartupItemsProvider } from "install/StartupItemsProvider";

@injectable()
export class Installer {
    private static readonly OneSecondTimeout: number = 1000;

    constructor(
        private readonly logger: Logger,
        private readonly startupItemsProvider: StartupItemsProvider,
        private readonly startupHandler: StartupHandler) {
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
        this.startupHandler.enableStartup();
        this.spawnUpdate(["--createShortcut", this.startupItemsProvider.exePath, this.getShortcutLocations()]);
        this.quit(Installer.OneSecondTimeout);
    }

    private handleUninstall(): void {
        this.startupHandler.disableStartup();
        this.spawnUpdate(["--removeShortcut", this.startupItemsProvider.exePath, this.getShortcutLocations()]);
        this.quit(Installer.OneSecondTimeout);
    }

    private getShortcutLocations(): string {
        return "--shortcut-locations=StartMenu";
    }

    private handleObsolete(): void {
        this.quit();
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
        return this.spawn(this.startupItemsProvider.updateExePath, args);
    }

    private quit(timeout: number = 0): void {
        setTimeout(app.quit, timeout);
    }
}