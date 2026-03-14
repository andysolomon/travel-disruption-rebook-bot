import { Link } from "react-router";
import type { Claim } from "../types/claim.ts";
import StatusPill from "./StatusPill.tsx";
import "./ClaimRow.css";

type StatusVariant = "green" | "yellow" | "red" | "blue" | "gray";

const claimStatusVariant: Record<string, StatusVariant> = {
  draft: "gray",
  ready: "blue",
  filed: "yellow",
  acknowledged: "yellow",
  paid: "green",
  rejected: "red",
};

export default function ClaimRow({ claim }: { claim: Claim }) {
  return (
    <Link to={`/claims/${claim.id}`} className="claim-row-link">
      <div className="claim-row">
        <div className="claim-row__id">{claim.id}</div>
        <div className="claim-row__flight">{claim.flightNumber}</div>
        <div className="claim-row__regulation">{claim.regulation}</div>
        <div className="claim-row__payout">
          {claim.estimatedPayout.currency} {claim.estimatedPayout.value}
        </div>
        <StatusPill
          label={claim.status}
          variant={claimStatusVariant[claim.status] ?? "gray"}
        />
      </div>
    </Link>
  );
}
