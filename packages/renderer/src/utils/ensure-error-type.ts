export function ensureErrorType(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'object') {
    const errorObject = error as Record<string, unknown>;
    return {
      message: errorObject?.message?.toString() ?? JSON.stringify(error) ?? '<unknown-error>',
      stack: errorObject?.stack?.toString() ?? '<no-stack>',
      name: errorObject?.name?.toString() ?? '<no-name>'
    };
  }

  return {
    message: error ? JSON.stringify(error) : '<unknown-error>',
    stack: '<no-stack>',
    name: '<no-name>'
  };
}
