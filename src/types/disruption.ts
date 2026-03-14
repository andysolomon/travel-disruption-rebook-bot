import type { ISODateTime, MonetaryAmount } from "./common.ts";

export type DisruptionType = "cancellation" | "delay" | "missed-connection" | "downgrade";

export type DisruptionSeverity = "low" | "medium" | "high" | "critical";

export type RegulationFramework = "EU261" | "UK261" | "MontrealConvention";

export type EligibilityStatus = "eligible" | "ineligible" | "needs-review" | "unknown";

export type EligibilityResult = {
  regulation: RegulationFramework;
  status: EligibilityStatus;
  estimatedPayout?: MonetaryAmount;
  reason?: string;
};

export type Disruption = {
  id: string;
  tripId: string;
  flightLegId: string;
  type: DisruptionType;
  severity: DisruptionSeverity;
  detectedAt: ISODateTime;
  summary: string;
  delayMinutes?: number;
  eligibility?: EligibilityResult;
  cause?: string;
  noticeDate?: ISODateTime;
};
