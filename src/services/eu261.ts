import type { MonetaryAmount } from "../types/common.ts";
import type { FlightLeg } from "../types/flight.ts";
import type { DisruptionType, EligibilityResult } from "../types/disruption.ts";
import { getDistanceKm } from "../data/airport-distances.ts";
import { isExtraordinaryCircumstance } from "../data/extraordinary-circumstances.ts";

export function calculatePayout(distanceKm: number): MonetaryAmount {
  if (distanceKm <= 1500) return { value: 250, currency: "EUR" };
  if (distanceKm <= 3500) return { value: 400, currency: "EUR" };
  return { value: 600, currency: "EUR" };
}

export function assessEligibility(
  leg: FlightLeg,
  disruption: {
    type: DisruptionType;
    delayMinutes?: number;
    cause?: string;
    noticeDate?: string;
  },
): EligibilityResult {
  const distanceKm = getDistanceKm(leg.origin.code, leg.destination.code);
  const payout = distanceKm !== undefined ? calculatePayout(distanceKm) : undefined;

  // Extraordinary circumstances → needs-review
  if (disruption.cause && isExtraordinaryCircumstance(disruption.cause)) {
    return {
      regulation: "EU261",
      status: "needs-review",
      estimatedPayout: payout,
      reason: `Disruption caused by "${disruption.cause}" — may qualify as extraordinary circumstances, which could exempt the airline from compensation.`,
    };
  }

  switch (disruption.type) {
    case "cancellation": {
      if (!disruption.noticeDate) {
        return {
          regulation: "EU261",
          status: "eligible",
          estimatedPayout: payout,
          reason: "Flight was cancelled with no advance notice recorded. Compensation is due under EU 261/2004.",
        };
      }
      const notice = new Date(disruption.noticeDate);
      const departure = new Date(leg.scheduledDeparture);
      const daysBefore = Math.floor((departure.getTime() - notice.getTime()) / (1000 * 60 * 60 * 24));
      if (daysBefore >= 14) {
        return {
          regulation: "EU261",
          status: "ineligible",
          reason: `Airline provided ${daysBefore} days' notice of cancellation. EU 261/2004 requires less than 14 days' notice for compensation.`,
        };
      }
      return {
        regulation: "EU261",
        status: "eligible",
        estimatedPayout: payout,
        reason: `Airline provided only ${daysBefore} days' notice of cancellation (under the 14-day threshold). Compensation is due under EU 261/2004.`,
      };
    }

    case "delay": {
      if (disruption.delayMinutes === undefined) {
        return {
          regulation: "EU261",
          status: "unknown",
          reason: "Delay duration is not yet known. Eligibility will be assessed once arrival data is available.",
        };
      }
      if (disruption.delayMinutes >= 180) {
        return {
          regulation: "EU261",
          status: "eligible",
          estimatedPayout: payout,
          reason: `Flight arrived ${disruption.delayMinutes} minutes late (≥3 hours). Compensation is due under EU 261/2004.`,
        };
      }
      return {
        regulation: "EU261",
        status: "ineligible",
        reason: `Flight arrived ${disruption.delayMinutes} minutes late (under the 3-hour threshold). No compensation under EU 261/2004.`,
      };
    }

    case "missed-connection":
      return {
        regulation: "EU261",
        status: "eligible",
        estimatedPayout: payout,
        reason: "Missed connecting flight due to prior leg delay. Compensation is due under EU 261/2004.",
      };

    case "downgrade":
      return {
        regulation: "EU261",
        status: "eligible",
        reason: "Involuntary downgrade. Partial refund is due under EU 261/2004 Article 10.",
      };
  }
}
