import "./StatusPill.css";

type StatusVariant = "green" | "yellow" | "red" | "blue" | "gray";

export default function StatusPill({ label, variant }: { label: string; variant: StatusVariant }) {
  return <span className={`status-pill status-pill--${variant}`}>{label}</span>;
}
