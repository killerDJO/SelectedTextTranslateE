import { injectable } from "inversify";
import { app } from "electron";
import { Logger } from "infrastructure/Logger";
import { StartupItemsProvider } from "install/StartupItemsProvider";
import { BehaviorSubject } from "rxjs";

@injectable()
export class StartupHandler {

    public readonly isStartupEnabled$: BehaviorSubject<boolean>;

    constructor(
        private readonly logger: Logger,
        private readonly startupItemsProvider: StartupItemsProvider) {

        this.isStartupEnabled$ = new BehaviorSubject(false);
        this.refreshStartupState();
    }

    public enableStartup(): void {
        this.configureStartup(true);
        this.logger.info("Startup enabled");
        this.refreshStartupState();
    }

    public disableStartup(): void {
        this.configureStartup(false);
        this.logger.info("Startup disabled");
        this.refreshStartupState();
    }

    private refreshStartupState(): void {
        const loginItemSettings = app.getLoginItemSettings({
            path: this.startupItemsProvider.updateExePath,
            args: this.getLoginArgs()
        });
        this.isStartupEnabled$.next(loginItemSettings.openAtLogin);
    }

    private configureStartup(enable: boolean) {
        app.setLoginItemSettings({
            openAtLogin: enable,
            path: this.startupItemsProvider.updateExePath,
            args: this.getLoginArgs()
        });
    }

    private getLoginArgs(): string[] {
        return [
            "--processStart", `"${this.startupItemsProvider.exePath}"`,
            "--process-start-args", '"--hidden"'
        ];
    }
}