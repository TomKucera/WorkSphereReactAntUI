export function shallowEqual<T extends Record<string, any>>(a: T, b: T) {
    const keys = Object.keys(a) as (keyof T)[];
    for (const key of keys) {
      if (a[key] !== b[key]) return false;
    }
    return true;
  }