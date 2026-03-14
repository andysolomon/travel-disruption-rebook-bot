export const STORAGE_KEYS = {
  CLAIMS: "rebook-bot:claims",
  PREFERENCES: "rebook-bot:preferences",
  ACTIVE_SCENARIO: "rebook-bot:active-scenario",
} as const;

export function getStored<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStored<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // window.localStorage full or unavailable — silently ignore
  }
}

export function removeStored(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // silently ignore
  }
}
