export function uniq<T>(array: Iterable<T>): T[] {
  return Array.from(new Set(array));
}

export type SortByGetter<T> = (value: T) => number | boolean | string | Date;

export function sortBy<T>(records: T[], getter: SortByGetter<T>, sortOrder: 'asc' | 'desc'): T[] {
  return records.sort((a, b) => {
    const aVal = getter(a);
    const bVal = getter(b);

    if (aVal > bVal) {
      return sortOrder === 'asc' ? 1 : -1;
    }

    if (aVal < bVal) {
      return sortOrder === 'asc' ? -1 : 1;
    }

    return 0;
  });
}
