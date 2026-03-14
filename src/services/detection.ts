import type { FlightLeg, Trip } from "../types/flight.ts";
import type { Disruption, DisruptionSeverity } from "../types/disruption.ts";
import type { ISODateTime } from "../types/common.ts";
import { assessEligibility } from "./eu261.ts";

function delaySeverity(minutes: number): DisruptionSeverity {
  if (minutes >= 180) return "high";
  if (minutes >= 60) return "medium";
  return "low";
}

export function detectDisruption(
  leg: FlightLeg,
  tripId: string,
  cause?: string,
  noticeDate?: string,
): Disruption | null {
  if (leg.status === "cancelled") {
    const eligibility = assessEligibility(leg, { type: "cancellation", cause, noticeDate });
    return {
      id: `dis-${leg.id}`,
      tripId,
      flightLegId: leg.id,
      type: "cancellation",
      severity: "critical",
      detectedAt: new Date().toISOString() as ISODateTime,
      summary: `Flight ${leg.flightNumber} (${leg.origin.code}→${leg.destination.code}) has been cancelled.`,
      eligibility,
      cause,
      noticeDate: noticeDate as ISODateTime | undefined,
    };
  }

  if (leg.actualArrival && leg.scheduledArrival) {
    const scheduled = new Date(leg.scheduledArrival).getTime();
    const actual = new Date(leg.actualArrival).getTime();
    const delayMinutes = Math.round((actual - scheduled) / (1000 * 60));

    if (delayMinutes > 0) {
      const eligibility = assessEligibility(leg, { type: "delay", delayMinutes, cause });
      return {
        id: `dis-${leg.id}`,
        tripId,
        flightLegId: leg.id,
        type: "delay",
        severity: delaySeverity(delayMinutes),
        detectedAt: new Date().toISOString() as ISODateTime,
        summary: `Flight ${leg.flightNumber} (${leg.origin.code}→${leg.destination.code}) arrived ${delayMinutes} minutes late.`,
        delayMinutes,
        eligibility,
        cause,
      };
    }
  }

  return null;
}

export function detectMissedConnections(trip: Trip): Disruption | null {
  for (let i = 0; i < trip.legs.length - 1; i++) {
    const current = trip.legs[i];
    const next = trip.legs[i + 1];

    const arrivalTime = current.actualArrival ?? current.scheduledArrival;
    if (!current.actualArrival) continue; // only flag if we have actual data

    const arrival = new Date(arrivalTime).getTime();
    const nextDeparture = new Date(next.scheduledDeparture).getTime();

    if (arrival > nextDeparture) {
      const eligibility = assessEligibility(next, { type: "missed-connection" });
      return {
        id: `dis-mc-${next.id}`,
        tripId: trip.id,
        flightLegId: next.id,
        type: "missed-connection",
        severity: "high",
        detectedAt: new Date().toISOString() as ISODateTime,
        summary: `Missed connection: ${current.flightNumber} arrived after ${next.flightNumber} was scheduled to depart.`,
        eligibility,
      };
    }
  }
  return null;
}

export function detectAllDisruptions(trips: Trip[]): Disruption[] {
  const disruptions: Disruption[] = [];

  for (const trip of trips) {
    for (const leg of trip.legs) {
      const d = detectDisruption(leg, trip.id);
      if (d) disruptions.push(d);
    }
    const mc = detectMissedConnections(trip);
    if (mc) disruptions.push(mc);
  }

  return disruptions;
}
