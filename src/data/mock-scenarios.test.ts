import { applyScenario, scenarios } from "./mock-scenarios.ts";
import type { Scenario } from "./mock-scenarios.ts";
import { mockTrips } from "./mock-flights.ts";

describe("applyScenario", () => {
  it("returns original trips for empty updates", () => {
    const baseline = scenarios[0];
    const result = applyScenario(mockTrips, baseline);
    expect(result).toBe(mockTrips); // same reference when no updates
  });

  it("patches status on matching leg", () => {
    const scenario: Scenario = {
      id: "test",
      label: "Test",
      updates: [{ legId: "leg-1a", status: "cancelled" }],
    };
    const result = applyScenario(mockTrips, scenario);
    const leg = result[0].legs.find((l) => l.id === "leg-1a");
    expect(leg?.status).toBe("cancelled");
  });

  it("does not modify non-matching legs", () => {
    const scenario: Scenario = {
      id: "test",
      label: "Test",
      updates: [{ legId: "leg-1a", status: "cancelled" }],
    };
    const result = applyScenario(mockTrips, scenario);
    const leg = result[0].legs.find((l) => l.id === "leg-1b");
    expect(leg?.status).toBe("scheduled");
  });

  it("does not mutate original trips", () => {
    const scenario: Scenario = {
      id: "test",
      label: "Test",
      updates: [{ legId: "leg-1a", status: "cancelled" }],
    };
    const originalStatus = mockTrips[0].legs[0].status;
    applyScenario(mockTrips, scenario);
    expect(mockTrips[0].legs[0].status).toBe(originalStatus);
  });

  it("applies actualDeparture and actualArrival", () => {
    const scenario: Scenario = {
      id: "test",
      label: "Test",
      updates: [{
        legId: "leg-2a",
        status: "delayed",
        actualDeparture: "2026-03-18T16:00:00Z",
        actualArrival: "2026-03-18T16:45:00Z",
      }],
    };
    const result = applyScenario(mockTrips, scenario);
    const leg = result[1].legs.find((l) => l.id === "leg-2a");
    expect(leg?.actualDeparture).toBe("2026-03-18T16:00:00Z");
    expect(leg?.actualArrival).toBe("2026-03-18T16:45:00Z");
  });
});
