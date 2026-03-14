import type { DisruptionType, Disruption } from "../types/disruption.ts";
import type { Claim, DocumentRequirement, PayoutConfidence } from "../types/claim.ts";
import type { FlightLeg } from "../types/flight.ts";
import type { TravelerProfile } from "../types/traveler.ts";
import type { ISODateTime } from "../types/common.ts";
import { isExtraordinaryCircumstance } from "../data/extraordinary-circumstances.ts";

const documentsByType: Record<DisruptionType, Array<{ name: string; type: string }>> = {
  cancellation: [
    { name: "Booking confirmation", type: "pdf" },
    { name: "Cancellation notice", type: "pdf" },
    { name: "Photo ID", type: "image" },
  ],
  delay: [
    { name: "Booking confirmation", type: "pdf" },
    { name: "Boarding pass", type: "image" },
    { name: "Delay confirmation letter", type: "pdf" },
    { name: "Photo ID", type: "image" },
  ],
  "missed-connection": [
    { name: "Booking confirmation", type: "pdf" },
    { name: "Boarding pass (first leg)", type: "image" },
    { name: "Boarding pass (connecting leg)", type: "image" },
    { name: "Connection proof", type: "pdf" },
    { name: "Photo ID", type: "image" },
  ],
  downgrade: [
    { name: "Booking confirmation", type: "pdf" },
    { name: "Boarding pass", type: "image" },
    { name: "Original ticket (cabin class)", type: "pdf" },
    { name: "Photo ID", type: "image" },
  ],
};

export function getRequiredDocuments(type: DisruptionType): DocumentRequirement[] {
  const docs = documentsByType[type];
  return docs.map((doc, i) => ({
    id: `req-${i + 1}`,
    name: doc.name,
    type: doc.type,
    required: true,
    provided: false,
  }));
}

export function assessPayoutConfidence(disruption: Disruption): PayoutConfidence {
  if (
    (disruption.cause && isExtraordinaryCircumstance(disruption.cause)) ||
    disruption.eligibility?.status === "needs-review"
  ) {
    return "low";
  }

  if (
    (disruption.delayMinutes !== undefined && disruption.delayMinutes >= 170 && disruption.delayMinutes <= 190) ||
    disruption.eligibility?.status === "unknown"
  ) {
    return "medium";
  }

  return "high";
}

export function generateClaimDraft(
  disruption: Disruption,
  leg: FlightLeg,
  _traveler: TravelerProfile,
  now: ISODateTime,
): Claim {
  return {
    id: `claim-${disruption.id}`,
    disruptionId: disruption.id,
    flightNumber: leg.flightNumber,
    airlineCode: leg.airline.code,
    regulation: disruption.eligibility?.regulation ?? "EU261",
    status: "draft",
    estimatedPayout: disruption.eligibility?.estimatedPayout ?? { value: 0, currency: "EUR" },
    timeline: [{ date: now, label: "Claim drafted" }],
    documents: [],
    confidence: assessPayoutConfidence(disruption),
    requiredDocuments: getRequiredDocuments(disruption.type),
  };
}
