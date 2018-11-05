export interface HistorySyncSettings {
    interval: number;
    isContinuousSyncEnabled: boolean;
    backupOnApplicationStart: boolean;
    backupOnApplicationStartNumberToKeep: number;
    backupRegularly: boolean;
    backupRegularlyIntervalDays: number;
    backupRegularlyNumberToKeep: number;
}