import { calculatePayout, assessEligibility } from "./eu261.ts";
import type { FlightLeg } from "../types/flight.ts";
import type { ISODateTime } from "../types/common.ts";

function makeLeg(overrides: Partial<FlightLeg> = {}): FlightLeg {
  return {
    id: "leg-test",
    flightNumber: "XX100",
    airline: { code: "XX", name: "TestAir" },
    origin: { code: "LHR", name: "Heathrow", city: "London" },
    destination: { code: "BER", name: "Berlin Brandenburg", city: "Berlin" },
    scheduledDeparture: "2026-03-15T07:30:00Z" as ISODateTime,
    scheduledArrival: "2026-03-15T10:15:00Z" as ISODateTime,
    status: "scheduled",
    ...overrides,
  };
}

describe("calculatePayout", () => {
  it("returns €250 for distances <= 1500km", () => {
    const result = calculatePayout(930);
    expect(result.value).toBe(250);
    expect(result.currency).toBe("EUR");
  });

  it("returns €250 for exactly 1500km", () => {
    expect(calculatePayout(1500).value).toBe(250);
  });

  it("returns €400 for distances 1501-3500km", () => {
    expect(calculatePayout(2500).value).toBe(400);
  });

  it("returns €400 for exactly 3500km", () => {
    expect(calculatePayout(3500).value).toBe(400);
  });

  it("returns €600 for distances > 3500km", () => {
    expect(calculatePayout(5555).value).toBe(600);
  });
});

describe("assessEligibility", () => {
  it("cancellation with no notice → eligible", () => {
    const leg = makeLeg();
    const result = assessEligibility(leg, { type: "cancellation" });
    expect(result.status).toBe("eligible");
    expect(result.estimatedPayout).toBeDefined();
  });

  it("cancellation with >= 14 days notice → ineligible", () => {
    const leg = makeLeg({ scheduledDeparture: "2026-03-15T07:30:00Z" as ISODateTime });
    const result = assessEligibility(leg, {
      type: "cancellation",
      noticeDate: "2026-02-28T10:00:00Z", // 15 days before
    });
    expect(result.status).toBe("ineligible");
    expect(result.estimatedPayout).toBeUndefined();
  });

  it("cancellation with < 14 days notice → eligible", () => {
    const leg = makeLeg({ scheduledDeparture: "2026-03-15T07:30:00Z" as ISODateTime });
    const result = assessEligibility(leg, {
      type: "cancellation",
      noticeDate: "2026-03-05T10:00:00Z", // 10 days before
    });
    expect(result.status).toBe("eligible");
    expect(result.estimatedPayout).toBeDefined();
  });

  it("delay >= 180 min → eligible", () => {
    const leg = makeLeg();
    const result = assessEligibility(leg, { type: "delay", delayMinutes: 180 });
    expect(result.status).toBe("eligible");
  });

  it("delay < 180 min → ineligible", () => {
    const leg = makeLeg();
    const result = assessEligibility(leg, { type: "delay", delayMinutes: 179 });
    expect(result.status).toBe("ineligible");
  });

  it("delay with no minutes → unknown", () => {
    const leg = makeLeg();
    const result = assessEligibility(leg, { type: "delay" });
    expect(result.status).toBe("unknown");
  });

  it("extraordinary circumstances → needs-review", () => {
    const leg = makeLeg();
    const result = assessEligibility(leg, { type: "cancellation", cause: "weather" });
    expect(result.status).toBe("needs-review");
  });

  it("missed-connection → always eligible", () => {
    const leg = makeLeg();
    const result = assessEligibility(leg, { type: "missed-connection" });
    expect(result.status).toBe("eligible");
  });

  it("downgrade → always eligible", () => {
    const leg = makeLeg();
    const result = assessEligibility(leg, { type: "downgrade" });
    expect(result.status).toBe("eligible");
  });
});
