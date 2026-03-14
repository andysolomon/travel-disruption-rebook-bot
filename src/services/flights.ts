import type { Trip } from "../types/flight.ts";
import { mockTrips } from "../data/mock-flights.ts";
import { simulateApi } from "./api.ts";
import { isRealApiAvailable, fetchFlightLegs } from "./flight-api.ts";

async function enrichTripsWithLiveData(trips: Trip[]): Promise<Trip[]> {
  const enrichedTrips: Trip[] = [];

  for (const trip of trips) {
    const enrichedLegs = await Promise.all(
      trip.legs.map(async (leg) => {
        const liveLegs = await fetchFlightLegs(leg.flightNumber);
        if (!liveLegs || liveLegs.length === 0) return leg;

        const liveLeg = liveLegs[0];
        return {
          ...leg,
          status: liveLeg.status,
          ...(liveLeg.actualDeparture && { actualDeparture: liveLeg.actualDeparture }),
          ...(liveLeg.actualArrival && { actualArrival: liveLeg.actualArrival }),
        };
      }),
    );

    enrichedTrips.push({ ...trip, legs: enrichedLegs });
  }

  return enrichedTrips;
}

export async function getTrips(): Promise<Trip[]> {
  if (isRealApiAvailable()) {
    return enrichTripsWithLiveData(mockTrips);
  }
  return simulateApi(mockTrips);
}

export function getTripById(id: string): Promise<Trip | undefined> {
  return simulateApi(mockTrips.find((t) => t.id === id));
}
