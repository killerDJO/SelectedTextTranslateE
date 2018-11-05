import { injectable } from "inversify";
import { Observable, empty, merge, Subject, of, concat } from "rxjs";
import { concatMap, tap, map, takeLast } from "rxjs/operators";
import * as path from "path";
import * as fs from "fs";
import * as moment from "moment";
import * as mkdirp from "mkdirp";

import { HistorySyncSettings } from "common/dto/settings/HistorySyncSettings";

import { Logger } from "infrastructure/Logger";
import { NotificationSender } from "infrastructure/NotificationSender";

import { DatastoreProvider } from "data-access/DatastoreProvider";

import { HistorySettings } from "business-logic/settings/dto/Settings";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";

enum BackupType {
    Startup = "startup",
    Regular = "regular"
}

interface Backup {
    readonly filename: string;
    readonly createdDate: Date | null;
}

@injectable()
export class HistoryBackuper {

    private static readonly DateFormat: string = "DD-MM-YYYY-HH-mm-ss";
    private static readonly BackupExtension: string = "bak";
    private static readonly BackupDateRegExp: RegExp = /\d\d-\d\d-\d\d\d\d-\d\d-\d\d-\d\d(?=\.bak)/;

    private lastRegularBackupDate: Date | null = null;
    private regularSyncTask: NodeJS.Timer | null = null;
    private currentSyncSettings: HistorySyncSettings;

    constructor(
        private readonly settingsProvider: SettingsProvider,
        private readonly logger: Logger,
        private readonly notificationSender: NotificationSender,
        private readonly datastoreProvider: DatastoreProvider) {

        this.currentSyncSettings = this.getHistorySettings().sync;
        this.settingsProvider.getSettings().subscribe(newSettings => this.onRegularSyncSettingsChanged(newSettings.history.sync));
    }

    public createBackups(): Observable<void> {
        const historySyncSettings = this.getHistorySettings().sync;

        let startupBackupTask$ = empty();
        let regularBackupTask$ = empty();

        if (historySyncSettings.backupOnApplicationStart) {
            startupBackupTask$ = this.createStartupBackup();
        }

        if (historySyncSettings.backupRegularly) {
            regularBackupTask$ = new Observable<never>(observer => {
                this.startRegularBackup();
                observer.complete();
            });
        }

        return concat(startupBackupTask$, regularBackupTask$);
    }

    private createStartupBackup(): Observable<never> {
        const numberOfBackupsToStore = this.getHistorySettings().sync.backupOnApplicationStartNumberToKeep;
        return this.runBackup(BackupType.Startup, numberOfBackupsToStore);
    }

    private onRegularSyncSettingsChanged(newSettings: HistorySyncSettings): void {
        if (!newSettings.backupRegularly) {
            this.stopRegularBackup();
        } else if (!this.currentSyncSettings.backupRegularly && newSettings.backupRegularly) {
            this.startRegularBackup();
        } else if (this.currentSyncSettings.backupRegularlyIntervalDays !== newSettings.backupRegularlyIntervalDays) {
            this.stopRegularBackup();
            this.startRegularBackup();
        }

        this.currentSyncSettings = newSettings;
    }

    private stopRegularBackup(): void {
        if (this.regularSyncTask !== null) {
            clearTimeout(this.regularSyncTask);
            this.regularSyncTask = null;
            this.logger.info("Regular backup stopped.");
        }
    }

    private startRegularBackup(): void {
        let interval = this.getRegularBackupInterval();

        if (this.lastRegularBackupDate === null) {
            this.lastRegularBackupDate = new Date();
            this.logger.info(`Regular backup started. Time to next backup: ${interval}ms.`);
        } else {
            const elapsedMilliseconds = Date.now() - this.lastRegularBackupDate.getTime();
            interval = Math.max(0, interval - elapsedMilliseconds);
            this.logger.info(`Regular backup continued or restarted. Time to next backup: ${interval}ms.`);
        }

        this.regularSyncTask = setTimeout(
            () => {
                const numberOfBackupsToStore = this.getHistorySettings().sync.backupRegularlyNumberToKeep;
                this.runBackup(BackupType.Regular, numberOfBackupsToStore).subscribe({
                    complete: () => {
                        this.lastRegularBackupDate = new Date();
                        this.startRegularBackup();
                    }
                });
            },
            interval);
    }

    private getRegularBackupInterval(): number {
        const MillisecondsInSecond = 1000;
        const SecondsInMinute = 60;
        const MinutesInHour = 60;
        const HoursInDay = 24;
        return this.getHistorySettings().sync.backupRegularlyIntervalDays * HoursInDay * MinutesInHour * SecondsInMinute * MillisecondsInSecond;
    }

    private runBackup(backupType: BackupType, numberOfBackupsToStore: number): Observable<never> {
        return this.ensureBackupsFolderExists(backupType).pipe(
            concatMap(() => this.getExistingBackups(backupType)),
            concatMap(backups => this.deletePreviousBackups(backups, numberOfBackupsToStore, backupType)),
            concatMap(() => this.createBackup(backupType))
        );
    }

    private getHistorySettings(): HistorySettings {
        return this.settingsProvider.getSettings().value.history;
    }

    private getBackupsFolderPath(backupType: BackupType): string {
        const databaseFilename = this.getDatabaseFilename();
        const backupsFolder = path.join(databaseFilename, "..", "backups", backupType);
        return backupsFolder;
    }

    private createBackup(backupType: BackupType): Observable<never> {
        const databaseFilename = this.getDatabaseFilename();
        const backupsFolder = this.getBackupsFolderPath(backupType);
        const backupFilename = this.generateBackupFileName();
        const backupPath = path.join(backupsFolder, backupFilename);

        return new Observable(observer => {
            fs.copyFile(databaseFilename, backupPath, fs.constants.COPYFILE_EXCL, (error: NodeJS.ErrnoException) => {
                if (!!error && error.code === "EEXIST") {
                    this.notificationSender.showNonCriticalError(`Error creating ${backupType} backup. File already exists.`, error);
                } else {
                    this.handleFsError(error);
                    this.logger.info(`Backup ${backupFilename} successfully created. Type: ${backupType}.`);
                }

                observer.complete();
            });
        });
    }

    private ensureBackupsFolderExists(backupType: BackupType): Observable<void> {
        const backupsFolder = this.getBackupsFolderPath(backupType);
        return new Observable(observer => {
            mkdirp(backupsFolder, (error: NodeJS.ErrnoException) => {
                this.handleFsError(error);
                observer.next();
                observer.complete();
            });
        });
    }

    private deletePreviousBackups(existingBackups: Backup[], numberOfBackupsToStore: number, backupType: BackupType): Observable<Backup[]> {
        const wrongFormatBackups = existingBackups.filter(backup => backup.createdDate === null);
        const correctFormatBackups = existingBackups.filter(backup => backup.createdDate !== null);

        const wrongFormatBackupsDelete$ = this.deleteBackups(wrongFormatBackups, "invalid filename", backupType);

        const sortedBackups = correctFormatBackups.slice().sort((a, b) => {
            return (a.createdDate as Date).getTime() - (b.createdDate as Date).getTime();
        });

        const numberOfBackupsToDelete = Math.max(sortedBackups.length - numberOfBackupsToStore, 0);
        const backupsToDelete = sortedBackups.splice(0, numberOfBackupsToDelete);
        const backupsToDelete$ = this.deleteBackups(backupsToDelete, "number of records to keep has been exceeded", backupType);

        return merge(wrongFormatBackupsDelete$, backupsToDelete$, of(null)).pipe(takeLast(1), map(() => sortedBackups));
    }

    private deleteBackups(backups: Backup[], reason: string, backupType: BackupType): Observable<void> {
        return merge(...backups.map(backup => this.deleteBackup(backup.filename, reason, backupType)), 1);
    }

    private deleteBackup(filename: string, reason: string, backupType: BackupType): Observable<void> {
        return new Observable<void>(observer => {
            const backupPath = path.join(this.getBackupsFolderPath(backupType), filename);
            fs.unlink(backupPath, (error: NodeJS.ErrnoException) => {
                this.handleFsError(error);
                observer.next();
                observer.complete();
            });
        }).pipe(tap<void>(() => this.logger.info(`Backup ${filename} has been deleted. Type: ${backupType}. Reason: ${reason}.`)));
    }

    private getExistingBackups(backupType: BackupType): Observable<Backup[]> {
        const backupsFolder = this.getBackupsFolderPath(backupType);
        const result$ = new Subject<Backup[]>();

        fs.readdir(backupsFolder, (err, files) => {
            this.handleFsError(err);
            result$.next(files.map(file => ({
                filename: file,
                createdDate: this.getBackupCreatedDateFromFileName(file)
            })));
            result$.complete();
        });

        return result$;
    }

    private getDatabaseFilename(): string {
        return this.datastoreProvider.getDatabaseFilename(this.getHistorySettings().databaseName);
    }

    private generateBackupFileName(): string {
        const formattedDate = moment().format(HistoryBackuper.DateFormat);
        return `${this.getHistorySettings().databaseName}.${formattedDate}.${HistoryBackuper.BackupExtension}`;
    }

    private getBackupCreatedDateFromFileName(filename: string): Date | null {
        const matches = filename.match(HistoryBackuper.BackupDateRegExp);
        if (matches !== null) {
            return moment(matches[0], HistoryBackuper.DateFormat).toDate();
        }

        return null;
    }

    private handleFsError(error: NodeJS.ErrnoException): void {
        if (!!error) {
            throw new Error(error.message);
        }
    }
}