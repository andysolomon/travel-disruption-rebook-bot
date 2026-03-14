import { useEffect } from "react";
import { useParams } from "react-router";
import { useClaims } from "../hooks/useClaims.ts";
import useAnalytics from "../hooks/useAnalytics.ts";
import StatusPill from "../components/StatusPill.tsx";
import ConfidenceBand from "../components/ConfidenceBand.tsx";
import ClaimTimeline from "../components/ClaimTimeline.tsx";
import DocumentChecklist from "../components/DocumentChecklist.tsx";
import "./ClaimDetailPage.css";

type StatusVariant = "green" | "yellow" | "red" | "blue" | "gray";

const claimStatusVariant: Record<string, StatusVariant> = {
  draft: "gray",
  ready: "blue",
  filed: "yellow",
  acknowledged: "yellow",
  paid: "green",
  rejected: "red",
};

export default function ClaimDetailPage() {
  const { claimId } = useParams();
  const { claims } = useClaims();
  const { track } = useAnalytics();
  const claim = claims.find((c) => c.id === claimId);

  useEffect(() => {
    if (claimId) {
      track({ type: "claim_detail_viewed", claimId });
    }
  }, [claimId, track]);

  if (!claim) {
    return (
      <div className="claim-detail-page">
        <p className="empty">Claim not found.</p>
      </div>
    );
  }

  return (
    <div className="claim-detail-page">
      <header className="claim-detail__header">
        <h1>{claim.flightNumber}</h1>
        <span className="claim-detail__regulation">{claim.regulation}</span>
        <StatusPill label={claim.status} variant={claimStatusVariant[claim.status] ?? "gray"} />
        <ConfidenceBand payout={claim.estimatedPayout} confidence={claim.confidence} />
      </header>

      <section className="claim-detail__section">
        <h2>Timeline</h2>
        <ClaimTimeline entries={claim.timeline} />
      </section>

      <section className="claim-detail__section">
        <h2>Documents</h2>
        <DocumentChecklist requirements={claim.requiredDocuments} documents={claim.documents} />
      </section>
    </div>
  );
}
