export function debounce<TArgs extends Array<unknown>>(
  fn: (...args: TArgs) => void,
  delay: number
): (...args: TArgs) => void {
  let timeoutID: ReturnType<typeof setTimeout> | undefined = undefined;

  return function (this: unknown, ...args: TArgs) {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function replacePattern(pattern: string, key: string, value: string): string {
  return pattern.replace(new RegExp(`{{${key}}}`, 'g'), value);
}

export function replaceAllPattern(
  pattern: string,
  replacements: { [key: string]: string }
): string {
  let currentPattern = pattern;
  for (const key of Object.keys(replacements)) {
    currentPattern = replacePattern(currentPattern, key, replacements[key]);
  }
  return currentPattern;
}

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
