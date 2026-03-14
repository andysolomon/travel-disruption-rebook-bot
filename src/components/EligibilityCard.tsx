import type { EligibilityResult, EligibilityStatus } from "../types/disruption.ts";
import StatusPill from "./StatusPill.tsx";
import "./EligibilityCard.css";

const statusVariant: Record<EligibilityStatus, "green" | "yellow" | "red" | "gray"> = {
  eligible: "green",
  ineligible: "red",
  "needs-review": "yellow",
  unknown: "gray",
};

export default function EligibilityCard({ eligibility }: { eligibility: EligibilityResult }) {
  return (
    <div className="eligibility-card">
      <div className="eligibility-header">
        <StatusPill label={eligibility.status} variant={statusVariant[eligibility.status]} />
        <span className="eligibility-regulation">{eligibility.regulation}</span>
        {eligibility.estimatedPayout && (
          <span className="eligibility-payout">
            {eligibility.estimatedPayout.currency} {eligibility.estimatedPayout.value}
          </span>
        )}
      </div>
      {eligibility.reason && <p className="eligibility-reason">{eligibility.reason}</p>}
    </div>
  );
}
