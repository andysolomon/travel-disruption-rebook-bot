import { detectDisruption, detectMissedConnections, detectAllDisruptions } from "./detection.ts";
import type { FlightLeg, Trip } from "../types/flight.ts";
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

describe("detectDisruption", () => {
  it("detects cancellation", () => {
    const leg = makeLeg({ status: "cancelled" });
    const result = detectDisruption(leg, "trip-1");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("cancellation");
    expect(result!.severity).toBe("critical");
  });

  it("detects delay >= 180 min as high severity", () => {
    const leg = makeLeg({
      status: "delayed",
      actualArrival: "2026-03-15T13:15:00Z" as ISODateTime, // 180 min late
    });
    const result = detectDisruption(leg, "trip-1");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("delay");
    expect(result!.severity).toBe("high");
    expect(result!.delayMinutes).toBe(180);
  });

  it("detects delay >= 60 min as medium severity", () => {
    const leg = makeLeg({
      status: "delayed",
      actualArrival: "2026-03-15T11:15:00Z" as ISODateTime, // 60 min late
    });
    const result = detectDisruption(leg, "trip-1");
    expect(result!.severity).toBe("medium");
  });

  it("detects delay < 60 min as low severity", () => {
    const leg = makeLeg({
      status: "delayed",
      actualArrival: "2026-03-15T10:45:00Z" as ISODateTime, // 30 min late
    });
    const result = detectDisruption(leg, "trip-1");
    expect(result!.severity).toBe("low");
    expect(result!.delayMinutes).toBe(30);
  });

  it("returns null for on-time flight", () => {
    const leg = makeLeg({ status: "scheduled" });
    const result = detectDisruption(leg, "trip-1");
    expect(result).toBeNull();
  });

  it("returns null when actual arrival equals scheduled", () => {
    const leg = makeLeg({
      status: "landed",
      actualArrival: "2026-03-15T10:15:00Z" as ISODateTime,
    });
    const result = detectDisruption(leg, "trip-1");
    expect(result).toBeNull();
  });
});

describe("detectMissedConnections", () => {
  it("detects missed connection when arrival is after next departure", () => {
    const trip: Trip = {
      id: "trip-mc",
      name: "Missed Connection Trip",
      legs: [
        makeLeg({
          id: "leg-a",
          actualArrival: "2026-03-15T13:00:00Z" as ISODateTime, // arrives at 13:00
        }),
        makeLeg({
          id: "leg-b",
          scheduledDeparture: "2026-03-15T12:00:00Z" as ISODateTime, // departs at 12:00
        }),
      ],
    };
    const result = detectMissedConnections(trip);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("missed-connection");
  });

  it("returns null when connection is made", () => {
    const trip: Trip = {
      id: "trip-ok",
      name: "OK Trip",
      legs: [
        makeLeg({
          id: "leg-a",
          actualArrival: "2026-03-15T10:00:00Z" as ISODateTime,
        }),
        makeLeg({
          id: "leg-b",
          scheduledDeparture: "2026-03-15T12:00:00Z" as ISODateTime,
        }),
      ],
    };
    const result = detectMissedConnections(trip);
    expect(result).toBeNull();
  });

  it("returns null for single-leg trip", () => {
    const trip: Trip = {
      id: "trip-single",
      name: "Single",
      legs: [makeLeg()],
    };
    expect(detectMissedConnections(trip)).toBeNull();
  });
});

describe("detectAllDisruptions", () => {
  it("returns empty array for empty trips", () => {
    expect(detectAllDisruptions([])).toEqual([]);
  });

  it("detects disruptions across multiple trips", () => {
    const trips: Trip[] = [
      {
        id: "trip-a",
        name: "Trip A",
        legs: [makeLeg({ id: "leg-cancel", status: "cancelled" })],
      },
      {
        id: "trip-b",
        name: "Trip B",
        legs: [makeLeg({ id: "leg-ok", status: "scheduled" })],
      },
    ];
    const result = detectAllDisruptions(trips);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("cancellation");
  });
});
