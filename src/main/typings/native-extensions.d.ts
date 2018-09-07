declare module "*.node" {
    let value: NativeExtensions;
    export = value;

    interface NativeExtensions {
        playFile(filePath: string, volume: number, callback: (error: string | null) => void): void;
        broadcastCopyCommand(): void;
    }
}