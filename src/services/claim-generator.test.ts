import { getRequiredDocuments, assessPayoutConfidence, generateClaimDraft } from "./claim-generator.ts";
import type { Disruption } from "../types/disruption.ts";
import type { FlightLeg } from "../types/flight.ts";
import type { TravelerProfile } from "../types/traveler.ts";
import type { ISODateTime } from "../types/common.ts";

describe("getRequiredDocuments", () => {
  it("returns 3 documents for cancellation", () => {
    const docs = getRequiredDocuments("cancellation");
    expect(docs).toHaveLength(3);
    expect(docs.every((d) => d.required)).toBe(true);
    expect(docs.every((d) => !d.provided)).toBe(true);
  });

  it("returns 4 documents for delay", () => {
    expect(getRequiredDocuments("delay")).toHaveLength(4);
  });

  it("returns 5 documents for missed-connection", () => {
    expect(getRequiredDocuments("missed-connection")).toHaveLength(5);
  });

  it("returns 4 documents for downgrade", () => {
    expect(getRequiredDocuments("downgrade")).toHaveLength(4);
  });
});

describe("assessPayoutConfidence", () => {
  const baseDisruption: Disruption = {
    id: "dis-test",
    tripId: "trip-1",
    flightLegId: "leg-1",
    type: "cancellation",
    severity: "critical",
    detectedAt: "2026-03-15T00:00:00Z" as ISODateTime,
    summary: "Test disruption",
    eligibility: { regulation: "EU261", status: "eligible", reason: "Test" },
  };

  it("returns low for extraordinary circumstances", () => {
    const d: Disruption = { ...baseDisruption, cause: "weather" };
    expect(assessPayoutConfidence(d)).toBe("low");
  });

  it("returns low for needs-review eligibility", () => {
    const d: Disruption = {
      ...baseDisruption,
      eligibility: { regulation: "EU261", status: "needs-review", reason: "Test" },
    };
    expect(assessPayoutConfidence(d)).toBe("low");
  });

  it("returns medium for borderline delay (170-190 min)", () => {
    const d: Disruption = { ...baseDisruption, type: "delay", delayMinutes: 180 };
    expect(assessPayoutConfidence(d)).toBe("medium");
  });

  it("returns medium for unknown eligibility status", () => {
    const d: Disruption = {
      ...baseDisruption,
      eligibility: { regulation: "EU261", status: "unknown", reason: "Test" },
    };
    expect(assessPayoutConfidence(d)).toBe("medium");
  });

  it("returns high for clear eligible cancellation", () => {
    expect(assessPayoutConfidence(baseDisruption)).toBe("high");
  });
});

describe("generateClaimDraft", () => {
  const disruption: Disruption = {
    id: "dis-test",
    tripId: "trip-1",
    flightLegId: "leg-1",
    type: "cancellation",
    severity: "critical",
    detectedAt: "2026-03-15T00:00:00Z" as ISODateTime,
    summary: "Test",
    eligibility: {
      regulation: "EU261",
      status: "eligible",
      estimatedPayout: { value: 250, currency: "EUR" },
      reason: "Test",
    },
  };

  const leg: FlightLeg = {
    id: "leg-1",
    flightNumber: "LH903",
    airline: { code: "LH", name: "Lufthansa" },
    origin: { code: "LHR", name: "Heathrow", city: "London" },
    destination: { code: "BER", name: "Berlin", city: "Berlin" },
    scheduledDeparture: "2026-03-15T07:30:00Z" as ISODateTime,
    scheduledArrival: "2026-03-15T10:15:00Z" as ISODateTime,
    status: "cancelled",
  };

  const traveler: TravelerProfile = {
    id: "t-1",
    firstName: "Elena",
    lastName: "Kowalski",
    email: "test@example.com",
    preferences: {
      seatPreference: "aisle",
      cabinClass: "business",
      preferredAirlines: ["LH"],
      loyaltyPrograms: [],
      maxLayoverMinutes: 120,
    },
  };

  it("creates a draft claim with correct structure", () => {
    const claim = generateClaimDraft(disruption, leg, traveler, "2026-03-15T01:00:00Z" as ISODateTime);
    expect(claim.id).toBe("claim-dis-test");
    expect(claim.disruptionId).toBe("dis-test");
    expect(claim.flightNumber).toBe("LH903");
    expect(claim.airlineCode).toBe("LH");
    expect(claim.regulation).toBe("EU261");
    expect(claim.status).toBe("draft");
    expect(claim.estimatedPayout.value).toBe(250);
    expect(claim.timeline).toHaveLength(1);
    expect(claim.requiredDocuments.length).toBeGreaterThan(0);
    expect(claim.confidence).toBe("high");
  });
});
