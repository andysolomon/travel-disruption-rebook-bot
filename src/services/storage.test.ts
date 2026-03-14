import { getStored, setStored, removeStored, STORAGE_KEYS } from "./storage.ts";

// Create a simple in-memory storage mock
function createStorageMock(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

describe("storage", () => {
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createStorageMock();
    vi.stubGlobal("localStorage", mockStorage);
    Object.defineProperty(window, "localStorage", { value: mockStorage, writable: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getStored / setStored round-trip", () => {
    it("stores and retrieves an object", () => {
      const data = { name: "test", value: 42 };
      setStored("test-key", data);
      expect(getStored("test-key")).toEqual(data);
    });

    it("stores and retrieves an array", () => {
      const data = [1, 2, 3];
      setStored("arr-key", data);
      expect(getStored("arr-key")).toEqual([1, 2, 3]);
    });

    it("stores and retrieves a string", () => {
      setStored("str-key", "hello");
      expect(getStored("str-key")).toBe("hello");
    });
  });

  describe("getStored", () => {
    it("returns null for missing key", () => {
      expect(getStored("nonexistent")).toBeNull();
    });

    it("returns null for invalid JSON", () => {
      mockStorage.setItem("bad-json", "{invalid");
      expect(getStored("bad-json")).toBeNull();
    });
  });

  describe("removeStored", () => {
    it("removes a stored value", () => {
      setStored("remove-me", "value");
      removeStored("remove-me");
      expect(getStored("remove-me")).toBeNull();
    });

    it("does not throw for missing key", () => {
      expect(() => removeStored("nonexistent")).not.toThrow();
    });
  });

  describe("setStored error handling", () => {
    it("does not throw when localStorage throws", () => {
      const throwingStorage = createStorageMock();
      throwingStorage.setItem = () => { throw new DOMException("QuotaExceededError"); };
      vi.stubGlobal("localStorage", throwingStorage);
      Object.defineProperty(window, "localStorage", { value: throwingStorage, writable: true });
      expect(() => setStored("key", "value")).not.toThrow();
    });
  });

  describe("STORAGE_KEYS", () => {
    it("has expected keys", () => {
      expect(STORAGE_KEYS.CLAIMS).toBeDefined();
      expect(STORAGE_KEYS.PREFERENCES).toBeDefined();
      expect(STORAGE_KEYS.ACTIVE_SCENARIO).toBeDefined();
    });
  });
});
