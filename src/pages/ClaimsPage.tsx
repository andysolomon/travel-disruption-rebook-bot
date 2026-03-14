import { useClaims } from "../hooks/useClaims.ts";
import ClaimRow from "../components/ClaimRow.tsx";
import "./ClaimsPage.css";

export default function ClaimsPage() {
  const { claims } = useClaims();

  return (
    <div className="claims-page">
      <h1>Claims</h1>
      {claims.length === 0 ? (
        <p className="empty">No claims yet.</p>
      ) : (
        <div className="claims-list">
          {claims.map((claim) => (
            <ClaimRow key={claim.id} claim={claim} />
          ))}
        </div>
      )}
    </div>
  );
}
