import type { MonetaryAmount } from "../types/common.ts";
import type { PayoutConfidence } from "../types/claim.ts";
import "./ConfidenceBand.css";

const confidenceLabels: Record<PayoutConfidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export default function ConfidenceBand({
  payout,
  confidence,
}: {
  payout: MonetaryAmount;
  confidence: PayoutConfidence;
}) {
  return (
    <div className={`confidence-band confidence-band--${confidence}`}>
      <span className="confidence-band__amount">
        {payout.currency} {payout.value}
      </span>
      <span className="confidence-band__label">{confidenceLabels[confidence]}</span>
    </div>
  );
}
