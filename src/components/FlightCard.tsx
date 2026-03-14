import type { FlightLeg } from "../types/flight.ts";
import StatusPill from "./StatusPill.tsx";
import "./FlightCard.css";

type StatusVariant = "green" | "yellow" | "red" | "blue" | "gray";

const statusVariant: Record<string, StatusVariant> = {
  scheduled: "blue",
  boarding: "blue",
  departed: "blue",
  "in-air": "blue",
  landed: "green",
  delayed: "yellow",
  cancelled: "red",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function FlightCard({ leg }: { leg: FlightLeg }) {
  return (
    <div className="flight-card">
      <div className="flight-card__header">
        <strong>{leg.flightNumber}</strong>
        <StatusPill label={leg.status} variant={statusVariant[leg.status] ?? "gray"} />
      </div>
      <div className="flight-card__route">
        {leg.origin.code} &rarr; {leg.destination.code}
      </div>
      <div className="flight-card__times">
        <span>{formatTime(leg.scheduledDeparture)}</span>
        <span className="flight-card__sep">&ndash;</span>
        <span>{formatTime(leg.scheduledArrival)}</span>
      </div>
      <div className="flight-card__airline">{leg.airline.name}</div>
    </div>
  );
}
