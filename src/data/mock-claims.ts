import type { Claim } from "../types/claim.ts";

export const mockClaims: Claim[] = [
  {
    id: "claim-1",
    disruptionId: "dis-1",
    flightNumber: "LH903",
    airlineCode: "LH",
    regulation: "EU261",
    status: "draft",
    estimatedPayout: { value: 250, currency: "EUR" },
    timeline: [
      { date: "2026-03-14T22:15:00Z", label: "Disruption detected" },
      { date: "2026-03-14T22:16:00Z", label: "Eligibility confirmed \u2014 EU261" },
    ],
    documents: [
      { id: "doc-1a", name: "Booking confirmation", type: "pdf", addedAt: "2026-03-14T22:17:00Z" },
    ],
    confidence: "high",
    requiredDocuments: [
      { id: "req-1a", name: "Booking confirmation", type: "pdf", required: true, provided: true },
      { id: "req-1b", name: "Cancellation notice", type: "pdf", required: true, provided: false },
      { id: "req-1c", name: "Photo ID", type: "image", required: true, provided: false },
    ],
  },
  {
    id: "claim-2",
    disruptionId: "dis-2",
    flightNumber: "BA357",
    airlineCode: "BA",
    regulation: "EU261",
    status: "ready",
    estimatedPayout: { value: 250, currency: "EUR" },
    timeline: [
      { date: "2026-03-18T13:20:00Z", label: "Disruption detected" },
      { date: "2026-03-18T13:21:00Z", label: "Eligibility confirmed \u2014 EU261" },
      { date: "2026-03-18T19:00:00Z", label: "All documents gathered" },
      { date: "2026-03-18T19:01:00Z", label: "Claim ready to file" },
    ],
    documents: [
      { id: "doc-2a", name: "Booking confirmation", type: "pdf", addedAt: "2026-03-18T13:22:00Z" },
      { id: "doc-2b", name: "Delay certificate", type: "pdf", addedAt: "2026-03-18T19:00:00Z" },
      { id: "doc-2c", name: "Boarding pass", type: "image", addedAt: "2026-03-18T19:00:00Z" },
    ],
    confidence: "high",
    requiredDocuments: [
      { id: "req-2a", name: "Booking confirmation", type: "pdf", required: true, provided: true },
      { id: "req-2b", name: "Boarding pass", type: "image", required: true, provided: true },
      { id: "req-2c", name: "Delay confirmation letter", type: "pdf", required: true, provided: true },
      { id: "req-2d", name: "Photo ID", type: "image", required: true, provided: false },
    ],
  },
];
