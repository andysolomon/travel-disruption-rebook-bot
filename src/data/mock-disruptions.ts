import type { Disruption } from "../types/disruption.ts";

export const mockDisruptions: Disruption[] = [
  {
    id: "dis-1",
    tripId: "trip-1",
    flightLegId: "leg-1a",
    type: "cancellation",
    severity: "critical",
    detectedAt: "2026-03-14T22:10:00Z",
    summary: "LH903 LHR\u2192FRA cancelled due to crew shortage. Connecting LH182 at risk.",
    eligibility: {
      regulation: "EU261",
      status: "eligible",
      estimatedPayout: { value: 250, currency: "EUR" },
      reason: "Flight distance under 1500 km, cancellation with less than 14 days notice.",
    },
  },
  {
    id: "dis-2",
    tripId: "trip-2",
    flightLegId: "leg-2a",
    type: "delay",
    severity: "high",
    detectedAt: "2026-03-18T13:15:00Z",
    summary: "BA357 CDG\u2192LHR delayed 240 minutes. Arrival now 18:45.",
    delayMinutes: 240,
    eligibility: {
      regulation: "EU261",
      status: "eligible",
      estimatedPayout: { value: 250, currency: "EUR" },
      reason: "Delay exceeds 3 hours on intra-EU route under 1500 km.",
    },
  },
  {
    id: "dis-3",
    tripId: "trip-3",
    flightLegId: "leg-3b",
    type: "delay",
    severity: "low",
    detectedAt: "2026-03-25T17:00:00Z",
    summary: "AZ208 MXP\u2192LHR delayed 45 minutes. Minor impact.",
    delayMinutes: 45,
  },
];
