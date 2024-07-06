export function toISODate(input: number | Date | undefined): string | undefined {
  if (!input) {
    return undefined;
  }

  return new Date(input).toISOString().split('T')[0];
}

export function ensureEndOfDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function ensureStartOfDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}
