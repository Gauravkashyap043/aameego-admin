// utils/localStorageHelper.ts

const safeJSON = {
  parse<T = any>(value: string | null): T | null {
    try {
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.warn("Failed to parse JSON from localStorage:", err);
      return null;
    }
  },

  stringify(value: any): string | null {
    try {
      return JSON.stringify(value);
    } catch (err) {
      console.warn("Failed to stringify value for localStorage:", err);
      return null;
    }
  },
};

export const localStorageHelper = {
  set<T = any>(key: string, value: T): void {
    const str = safeJSON.stringify(value);
    if (str !== null) {
      localStorage.setItem(key, str);
    }
  },

  get<T = any>(key: string): T | null {
    const item = localStorage.getItem(key);
    return safeJSON.parse<T>(item);
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  },

  clear(): void {
    localStorage.clear();
  },

  keys(): string[] {
    return Object.keys(localStorage);
  },

  length(): number {
    return localStorage.length;
  },
};
