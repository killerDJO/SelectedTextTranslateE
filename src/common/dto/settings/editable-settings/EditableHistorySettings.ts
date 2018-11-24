export interface EditableHistorySettings {
    numberOfRecordsPerPage: number;
    syncInterval: number;
    isContinuousSyncEnabled: boolean;
    backupOnApplicationStart: boolean;
    backupOnApplicationStartNumberToKeep: number;
    backupRegularly: boolean;
    backupRegularlyIntervalDays: number;
    backupRegularlyNumberToKeep: number;
}