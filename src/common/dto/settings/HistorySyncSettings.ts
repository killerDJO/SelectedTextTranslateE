export interface HistorySyncSettings {
    interval: number;
    isContinuousSyncEnabled: boolean;
    powerResumeDelaySeconds: number;
    backupOnApplicationStart: boolean;
    backupOnApplicationStartNumberToKeep: number;
    backupRegularly: boolean;
    backupRegularlyIntervalDays: number;
    backupRegularlyNumberToKeep: number;
}