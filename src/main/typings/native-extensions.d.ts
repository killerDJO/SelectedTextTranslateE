declare module "*.node" {
    let value: NativeExtensions;
    export = value;

    interface NativeExtensions {
        playFile(filePath: string): void;
        broadcastCopyCommand(): void;
    }
}