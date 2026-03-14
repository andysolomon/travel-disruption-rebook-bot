import type { Disruption } from "../types/disruption.ts";
import type { Trip } from "../types/flight.ts";
import type { TravelerPreferences } from "../types/traveler.ts";
import type { RebookOption } from "../types/rebook.ts";
import type { ISODateTime } from "../types/common.ts";
import { getAlternatives } from "../data/mock-alternatives.ts";
import { rankAlternatives } from "./scoring.ts";

export function getEffectiveRoute(
  disruption: Disruption,
  trip: Trip,
): { origin: string; destination: string; originalDeparture: ISODateTime } {
  const disruptedLeg = trip.legs.find((l) => l.id === disruption.flightLegId);
  const origin = disruptedLeg ? disruptedLeg.origin.code : trip.legs[0].origin.code;
  const originalDeparture = disruptedLeg
    ? disruptedLeg.scheduledDeparture
    : trip.legs[0].scheduledDeparture;
  const destination = trip.legs[trip.legs.length - 1].destination.code;

  return { origin, destination, originalDeparture };
}

export function getRebookOptions(
  disruption: Disruption,
  trip: Trip,
  preferences: TravelerPreferences,
): RebookOption[] {
  const { origin, destination, originalDeparture } = getEffectiveRoute(disruption, trip);
  const alternatives = getAlternatives(origin, destination);
  return rankAlternatives(alternatives, preferences, originalDeparture);
}
