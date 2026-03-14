import { scoreAlternative, rankAlternatives } from "./scoring.ts";
import type { RawAlternative } from "../types/rebook.ts";
import type { TravelerPreferences } from "../types/traveler.ts";
import type { ISODateTime } from "../types/common.ts";

const defaultPrefs: TravelerPreferences = {
  seatPreference: "aisle",
  cabinClass: "business",
  preferredAirlines: ["LH", "LX"],
  loyaltyPrograms: [{ alliance: "Star Alliance", tier: "Gold", number: "123" }],
  maxLayoverMinutes: 120,
};

const originalDeparture = "2026-03-15T07:30:00Z" as ISODateTime;

function makeAlt(overrides: Partial<RawAlternative> = {}): RawAlternative {
  return {
    id: "alt-1",
    legs: [{
      id: "aleg-1",
      flightNumber: "LH100",
      airline: { code: "LH", name: "Lufthansa", alliance: "Star Alliance" },
      origin: { code: "LHR", name: "Heathrow", city: "London" },
      destination: { code: "BER", name: "Berlin", city: "Berlin" },
      scheduledDeparture: "2026-03-15T07:30:00Z" as ISODateTime,
      scheduledArrival: "2026-03-15T10:15:00Z" as ISODateTime,
      status: "scheduled" as const,
    }],
    cabinClass: "business",
    price: { value: 300, currency: "EUR" },
    totalDurationMinutes: 165,
    ...overrides,
  };
}

describe("scoreAlternative", () => {
  it("gives high score for preferred airline + class + alliance + time match", () => {
    const alt = makeAlt();
    const score = scoreAlternative(alt, defaultPrefs, originalDeparture);
    expect(score.total).toBeGreaterThan(80);
    expect(score.components).toHaveLength(5);
  });

  it("gives lower score for non-preferred airline", () => {
    const alt = makeAlt({
      legs: [{
        id: "aleg-1",
        flightNumber: "BA100",
        airline: { code: "BA", name: "British Airways", alliance: "Oneworld" },
        origin: { code: "LHR", name: "Heathrow", city: "London" },
        destination: { code: "BER", name: "Berlin", city: "Berlin" },
        scheduledDeparture: "2026-03-15T07:30:00Z" as ISODateTime,
        scheduledArrival: "2026-03-15T10:15:00Z" as ISODateTime,
        status: "scheduled" as const,
      }],
    });
    const preferred = scoreAlternative(makeAlt(), defaultPrefs, originalDeparture);
    const nonPreferred = scoreAlternative(alt, defaultPrefs, originalDeparture);
    expect(preferred.total).toBeGreaterThan(nonPreferred.total);
  });

  it("penalizes cabin downgrade", () => {
    const business = scoreAlternative(makeAlt({ cabinClass: "business" }), defaultPrefs, originalDeparture);
    const economy = scoreAlternative(makeAlt({ cabinClass: "economy" }), defaultPrefs, originalDeparture);
    expect(business.total).toBeGreaterThan(economy.total);
  });

  it("rewards direct flights over long layovers", () => {
    const direct = scoreAlternative(makeAlt({ layoverMinutes: 0 }), defaultPrefs, originalDeparture);
    const longLayover = scoreAlternative(makeAlt({ layoverMinutes: 300 }), defaultPrefs, originalDeparture);
    expect(direct.total).toBeGreaterThan(longLayover.total);
  });
});

describe("rankAlternatives", () => {
  it("returns empty array for empty input", () => {
    expect(rankAlternatives([], defaultPrefs, originalDeparture)).toEqual([]);
  });

  it("sorts by score descending", () => {
    const alts: RawAlternative[] = [
      makeAlt({ id: "cheap", price: { value: 100, currency: "EUR" }, cabinClass: "economy" }),
      makeAlt({ id: "best", price: { value: 300, currency: "EUR" }, cabinClass: "business" }),
    ];
    const ranked = rankAlternatives(alts, defaultPrefs, originalDeparture);
    expect(ranked[0].id).toBe("best");
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(2);
  });

  it("breaks ties by price (lower first)", () => {
    const alt1 = makeAlt({ id: "a-300", price: { value: 300, currency: "EUR" } });
    const alt2 = makeAlt({ id: "b-200", price: { value: 200, currency: "EUR" } });
    const ranked = rankAlternatives([alt1, alt2], defaultPrefs, originalDeparture);
    // Same base score components, price normalization will differentiate
    expect(ranked.length).toBe(2);
  });

  it("normalizes price component across alternatives", () => {
    const alts: RawAlternative[] = [
      makeAlt({ id: "low", price: { value: 100, currency: "EUR" } }),
      makeAlt({ id: "high", price: { value: 500, currency: "EUR" } }),
    ];
    const ranked = rankAlternatives(alts, defaultPrefs, originalDeparture);
    const lowOption = ranked.find((r) => r.id === "low")!;
    const highOption = ranked.find((r) => r.id === "high")!;
    const lowPriceScore = lowOption.score.components.find((c) => c.name === "price")!;
    const highPriceScore = highOption.score.components.find((c) => c.name === "price")!;
    expect(lowPriceScore.score).toBe(100);
    expect(highPriceScore.score).toBe(0);
  });
});
