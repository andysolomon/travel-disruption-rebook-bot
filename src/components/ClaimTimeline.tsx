import type { ClaimTimelineEntry } from "../types/claim.ts";
import "./ClaimTimeline.css";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ClaimTimeline({ entries }: { entries: ClaimTimelineEntry[] }) {
  return (
    <div className="claim-timeline" role="list" aria-label="Claim timeline">
      {entries.map((entry, i) => (
        <div key={entry.date + entry.label} className="claim-timeline__item" role="listitem">
          <div className={`claim-timeline__dot ${i === entries.length - 1 ? "claim-timeline__dot--active" : ""}`} />
          {i < entries.length - 1 && <div className="claim-timeline__line" />}
          <div className="claim-timeline__content">
            <span className="claim-timeline__label">{entry.label}</span>
            <span className="claim-timeline__date">{formatDate(entry.date)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
