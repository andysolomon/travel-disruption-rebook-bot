import type { Disruption } from "../types/disruption.ts";
import type { Trip } from "../types/flight.ts";
import { mockTrips } from "../data/mock-flights.ts";
import { detectAllDisruptions } from "./detection.ts";
import { simulateApi } from "./api.ts";

const computedDisruptions = detectAllDisruptions(mockTrips);

export function getDisruptions(): Promise<Disruption[]> {
  return simulateApi(computedDisruptions);
}

export function getDisruptionsFromTrips(trips: Trip[]): Disruption[] {
  return detectAllDisruptions(trips);
}

export function getDisruptionsByTripId(tripId: string): Promise<Disruption[]> {
  return simulateApi(computedDisruptions.filter((d) => d.tripId === tripId));
}
