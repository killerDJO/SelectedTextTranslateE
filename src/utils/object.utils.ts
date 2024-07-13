import { toRaw } from 'vue';

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }

    return true;
  }

  if (isObject(a) && isObject(b)) {
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) {
      return false;
    }

    for (const key in a) {
      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  return a === b;
}

export function cloneDeep<T>(value: T): T {
  return structuredClone(toRawDeep(value));
}

function toRawDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(toRawDeep) as T;
  }

  const rawValue = toRaw(value);
  if (isObject(rawValue)) {
    const keys = Object.keys(rawValue);

    for (const key of keys) {
      (rawValue as Record<string, unknown>)[key] = toRawDeep(rawValue[key]);
    }
  }

  return rawValue;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
