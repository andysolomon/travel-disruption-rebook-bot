export function simulateApi<T>(data: T, delayMs = 200 + Math.random() * 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs));
}

export async function fetchWithFallback<T>(fetcher: () => Promise<T | null>, fallback: T): Promise<T> {
  try {
    const result = await fetcher();
    return result ?? fallback;
  } catch {
    return fallback;
  }
}
