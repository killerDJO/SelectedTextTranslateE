declare module '*.node' {
  let value: NativeExtensions;
  export = value;

  interface NativeExtensions {
    broadcastCopyCommand(): void;
  }
}
