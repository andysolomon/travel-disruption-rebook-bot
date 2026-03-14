import type { FlightStatus, Trip } from "../types/flight.ts";
import type { ISODateTime } from "../types/common.ts";

export type FlightUpdate = {
  legId: string;
  status?: FlightStatus;
  actualDeparture?: ISODateTime;
  actualArrival?: ISODateTime;
  cause?: string;
  noticeDate?: ISODateTime;
};

export type Scenario = {
  id: string;
  label: string;
  updates: FlightUpdate[];
};

export const scenarios: Scenario[] = [
  {
    id: "baseline",
    label: "Baseline (current mock state)",
    updates: [],
  },
  {
    id: "weather-disruption",
    label: "Weather disruption (LH903 cancelled)",
    updates: [
      {
        legId: "leg-1a",
        status: "cancelled",
        cause: "weather",
      },
    ],
  },
  {
    id: "advance-notice",
    label: "Advance notice cancellation (LH903)",
    updates: [
      {
        legId: "leg-1a",
        status: "cancelled",
        noticeDate: "2026-02-23T10:00:00Z",
      },
    ],
  },
  {
    id: "short-delay",
    label: "Short delay (BA357 2hr delay)",
    updates: [
      {
        legId: "leg-2a",
        status: "delayed",
        actualDeparture: "2026-03-18T16:00:00Z",
        actualArrival: "2026-03-18T16:45:00Z",
        cause: undefined,
      },
    ],
  },
];

export function applyScenario(trips: Trip[], scenario: Scenario): Trip[] {
  if (scenario.updates.length === 0) return trips;

  return trips.map((trip) => ({
    ...trip,
    legs: trip.legs.map((leg) => {
      const update = scenario.updates.find((u) => u.legId === leg.id);
      if (!update) return leg;
      return {
        ...leg,
        ...(update.status !== undefined && { status: update.status }),
        ...(update.actualDeparture !== undefined && { actualDeparture: update.actualDeparture }),
        ...(update.actualArrival !== undefined && { actualArrival: update.actualArrival }),
      };
    }),
  }));
}
