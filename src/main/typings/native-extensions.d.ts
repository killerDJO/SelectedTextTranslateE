declare module "*.node" {
    let value: NativeExtensions;
    export = value;

    interface NativeExtensions {
        playFile(filePath: string, callback: (error: string | null) => void): void;
        broadcastCopyCommand(): void;
    }
}