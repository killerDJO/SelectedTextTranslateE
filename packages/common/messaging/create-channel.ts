export function createChannel(message: string, windowId: number | string): string {
  return `${message}#${windowId}`;
}
