import type { DisruptionType, DisruptionSeverity } from "../types/disruption.ts";
import "./DisruptionBadge.css";

const severityClass: Record<DisruptionSeverity, string> = {
  low: "badge--low",
  medium: "badge--medium",
  high: "badge--high",
  critical: "badge--critical",
};

const typeLabel: Record<DisruptionType, string> = {
  cancellation: "Cancelled",
  delay: "Delayed",
  "missed-connection": "Missed Connection",
  downgrade: "Downgrade",
};

export default function DisruptionBadge({
  type,
  severity,
}: {
  type: DisruptionType;
  severity: DisruptionSeverity;
}) {
  return (
    <span className={`disruption-badge ${severityClass[severity]}`}>
      {typeLabel[type]} &middot; {severity}
    </span>
  );
}
