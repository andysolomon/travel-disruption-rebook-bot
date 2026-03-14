import type { ISODateTime, MonetaryAmount, AirlineCode } from "./common.ts";
import type { RegulationFramework } from "./disruption.ts";

export type ClaimStatus = "draft" | "ready" | "filed" | "acknowledged" | "paid" | "rejected";

export type PayoutConfidence = "high" | "medium" | "low";

export type DocumentRequirement = {
  id: string;
  name: string;
  type: string;
  required: boolean;
  provided: boolean;
};

export type ClaimTimelineEntry = {
  date: ISODateTime;
  label: string;
};

export type DocumentItem = {
  id: string;
  name: string;
  type: string;
  addedAt: ISODateTime;
};

export type Claim = {
  id: string;
  disruptionId: string;
  flightNumber: string;
  airlineCode: AirlineCode;
  regulation: RegulationFramework;
  status: ClaimStatus;
  estimatedPayout: MonetaryAmount;
  timeline: ClaimTimelineEntry[];
  documents: DocumentItem[];
  confidence: PayoutConfidence;
  requiredDocuments: DocumentRequirement[];
};
