export function ensureErrorType(error: any): Error {
  return {
    message: error?.message ?? error ?? '<unknown-error>',
    stack: error?.stack ?? '<no-stack>',
    name: error?.name ?? '<no-name>'
  };
}
