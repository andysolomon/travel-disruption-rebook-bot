import type { RebookOption } from "../types/rebook.ts";
import useAnalytics from "../hooks/useAnalytics.ts";
import "./RebookOptionsCard.css";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatPrice(option: RebookOption): string {
  const sym = option.price.currency === "GBP" ? "£" : option.price.currency === "USD" ? "$" : "€";
  return `${sym}${option.price.value}`;
}

export default function RebookOptionsCard({ options }: { options: RebookOption[] }) {
  const { track } = useAnalytics();

  if (options.length === 0) return null;

  return (
    <div className="rebook-options">
      <h4>Rebooking Options</h4>
      {options.map((opt) => {
        const firstLeg = opt.legs[0];
        const lastLeg = opt.legs[opt.legs.length - 1];
        const flightNumbers = opt.legs.map((l) => l.flightNumber).join(" → ");
        const airlineNames = [...new Set(opt.legs.map((l) => l.airline.name))].join(", ");
        const route = opt.legs.length === 1
          ? `${firstLeg.origin.code} → ${lastLeg.destination.code}`
          : `${firstLeg.origin.code} → ${opt.legs.map((l) => l.destination.code).join(" → ")}`;

        return (
          <div key={opt.id} className={`rebook-option${opt.rank === 1 ? " rebook-option--top" : ""}`}>
            <div className="rebook-option-header">
              <span className="rebook-rank">{opt.rank}</span>
              <span className="rebook-flights">{flightNumbers}</span>
              <span className="rebook-airline">{airlineNames}</span>
              <span className={opt.cabinClass === "business" ? "rebook-cabin--match" : "rebook-cabin--different"}>
                {opt.cabinClass}
              </span>
              <span className="rebook-score">{opt.score.total}/100</span>
              <span className="rebook-price">{formatPrice(opt)}</span>
            </div>

            <div className="rebook-route">{route}</div>

            <div className="rebook-times">
              <span>Dep: {formatTime(firstLeg.scheduledDeparture)}</span>
              <span>Arr: {formatTime(lastLeg.scheduledArrival)}</span>
              <span>Duration: {formatDuration(opt.totalDurationMinutes)}</span>
              {opt.layoverMinutes !== undefined && <span>Layover: {formatDuration(opt.layoverMinutes)}</span>}
            </div>

            <details className="rebook-details" onToggle={(e) => {
              if ((e.target as HTMLDetailsElement).open) {
                track({ type: "rebook_option_viewed", optionId: opt.id });
              }
            }}>
              <summary>Score breakdown</summary>
              {opt.score.components.map((comp) => (
                <div key={comp.name}>
                  <div className="rebook-component">
                    <span className="rebook-component-name">{comp.name}</span>
                    <div className="rebook-bar-track">
                      <div className="rebook-bar-fill" style={{ width: `${comp.score}%` }} />
                    </div>
                    <span className="rebook-component-score">{comp.score}</span>
                  </div>
                  <div className="rebook-component-explanation">{comp.explanation}</div>
                </div>
              ))}
            </details>
          </div>
        );
      })}
    </div>
  );
}
