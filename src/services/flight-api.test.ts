import { fetchFlightLegs } from "./flight-api.ts";

const mockResponse = {
  data: [{
    flight_status: "active",
    departure: {
      iata: "LHR",
      airport: "Heathrow",
      scheduled: "2026-03-15T07:30:00+00:00",
      actual: "2026-03-15T07:45:00+00:00",
    },
    arrival: {
      iata: "FRA",
      airport: "Frankfurt",
      scheduled: "2026-03-15T10:15:00+00:00",
      actual: null,
    },
    airline: { iata: "LH", name: "Lufthansa" },
    flight: { iata: "LH903" },
  }],
};

describe("fetchFlightLegs", () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = import.meta.env.VITE_FLIGHT_API_KEY;

  afterEach(() => {
    vi.stubGlobal("fetch", originalFetch);
    import.meta.env.VITE_FLIGHT_API_KEY = originalEnv;
  });

  it("returns null when no API key is set", async () => {
    import.meta.env.VITE_FLIGHT_API_KEY = "";
    const result = await fetchFlightLegs("LH903");
    expect(result).toBeNull();
  });

  it("returns mapped flight legs on success", async () => {
    import.meta.env.VITE_FLIGHT_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const result = await fetchFlightLegs("LH903");
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].flightNumber).toBe("LH903");
    expect(result![0].status).toBe("in-air");
    expect(result![0].origin.code).toBe("LHR");
    expect(result![0].destination.code).toBe("FRA");
    expect(result![0].actualDeparture).toBe("2026-03-15T07:45:00+00:00");
    expect(result![0].actualArrival).toBeUndefined();
  });

  it("returns null on network error", async () => {
    import.meta.env.VITE_FLIGHT_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    const result = await fetchFlightLegs("LH903");
    expect(result).toBeNull();
  });

  it("returns null on non-ok response (rate limit)", async () => {
    import.meta.env.VITE_FLIGHT_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    }));

    const result = await fetchFlightLegs("LH903");
    expect(result).toBeNull();
  });

  it("returns null when response has empty data", async () => {
    import.meta.env.VITE_FLIGHT_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    }));

    const result = await fetchFlightLegs("LH903");
    expect(result).toBeNull();
  });

  it("maps cancelled status correctly", async () => {
    import.meta.env.VITE_FLIGHT_API_KEY = "test-key";
    const cancelled = {
      data: [{
        ...mockResponse.data[0],
        flight_status: "cancelled",
      }],
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(cancelled),
    }));

    const result = await fetchFlightLegs("LH903");
    expect(result![0].status).toBe("cancelled");
  });

  it("maps landed status correctly", async () => {
    import.meta.env.VITE_FLIGHT_API_KEY = "test-key";
    const landed = {
      data: [{
        ...mockResponse.data[0],
        flight_status: "landed",
      }],
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(landed),
    }));

    const result = await fetchFlightLegs("LH903");
    expect(result![0].status).toBe("landed");
  });
});
