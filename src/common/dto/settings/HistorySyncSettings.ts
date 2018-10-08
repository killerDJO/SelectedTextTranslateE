export interface HistorySyncSettings {
    email: string;
    password: string;
    interval: number;
    lastSyncTime: string | undefined;
}