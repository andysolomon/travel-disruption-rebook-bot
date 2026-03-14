import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import type { Trip } from "../types/flight.ts";
import type { Disruption } from "../types/disruption.ts";
import type { TravelerProfile } from "../types/traveler.ts";
import type { RebookOption } from "../types/rebook.ts";
import { getTrips } from "../services/flights.ts";
import { getDisruptions, getDisruptionsFromTrips } from "../services/disruptions.ts";
import { getTravelerProfile } from "../services/traveler.ts";
import { getRebookOptions } from "../services/rebook.ts";
import { generateClaimDraft } from "../services/claim-generator.ts";
import { useClaims } from "../hooks/useClaims.ts";
import useAnalytics from "../hooks/useAnalytics.ts";
import { scenarios, applyScenario } from "../data/mock-scenarios.ts";
import type { Scenario } from "../data/mock-scenarios.ts";
import { detectDisruption, detectMissedConnections } from "../services/detection.ts";
import { getStored, setStored, STORAGE_KEYS } from "../services/storage.ts";
import FlightCard from "../components/FlightCard.tsx";
import DisruptionBadge from "../components/DisruptionBadge.tsx";
import EligibilityCard from "../components/EligibilityCard.tsx";
import RebookOptionsCard from "../components/RebookOptionsCard.tsx";
import "./DashboardPage.css";

function detectWithScenario(trips: Trip[], scenario: Scenario): Disruption[] {
  if (scenario.updates.length === 0) {
    return getDisruptionsFromTrips(trips);
  }

  const disruptions: Disruption[] = [];
  for (const trip of trips) {
    for (const leg of trip.legs) {
      const update = scenario.updates.find((u) => u.legId === leg.id);
      const d = detectDisruption(leg, trip.id, update?.cause, update?.noticeDate);
      if (d) disruptions.push(d);
    }
    const mc = detectMissedConnections(trip);
    if (mc) disruptions.push(mc);
  }
  return disruptions;
}

export default function DashboardPage() {
  const [baseTrips, setBaseTrips] = useState<Trip[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [traveler, setTraveler] = useState<TravelerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScenario, setActiveScenario] = useState<Scenario>(() => {
    const storedId = getStored<string>(STORAGE_KEYS.ACTIVE_SCENARIO);
    return scenarios.find((s) => s.id === storedId) ?? scenarios[0];
  });

  const navigate = useNavigate();
  const { addClaim, hasClaimForDisruption } = useClaims();
  const { track } = useAnalytics();

  useEffect(() => {
    Promise.all([getTrips(), getDisruptions(), getTravelerProfile()]).then(([t, d, profile]) => {
      setBaseTrips(t);
      const updatedTrips = applyScenario(t, activeScenario);
      setTrips(updatedTrips);
      setDisruptions(
        activeScenario.updates.length > 0
          ? detectWithScenario(updatedTrips, activeScenario)
          : d,
      );
      setTraveler(profile);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rebookMap = useMemo(() => {
    if (!traveler || disruptions.length === 0) return {};
    const map: Record<string, RebookOption[]> = {};
    for (const d of disruptions) {
      const trip = trips.find((t) => t.id === d.tripId);
      if (trip) {
        const options = getRebookOptions(d, trip, traveler.preferences);
        if (options.length > 0) {
          map[d.id] = options;
        }
      }
    }
    return map;
  }, [disruptions, trips, traveler]);

  function handleScenarioChange(scenarioId: string) {
    const scenario = scenarios.find((s) => s.id === scenarioId) ?? scenarios[0];
    track({ type: "scenario_changed", scenarioId });
    setStored(STORAGE_KEYS.ACTIVE_SCENARIO, scenario.id);
    setActiveScenario(scenario);
    const updatedTrips = applyScenario(baseTrips, scenario);
    setTrips(updatedTrips);
    setDisruptions(detectWithScenario(updatedTrips, scenario));
  }

  function handleGenerateClaim(disruption: Disruption) {
    if (!traveler) return;
    const trip = trips.find((t) => t.id === disruption.tripId);
    if (!trip) return;
    const leg = trip.legs.find((l) => l.id === disruption.flightLegId);
    if (!leg) return;

    const claim = generateClaimDraft(disruption, leg, traveler, new Date().toISOString());
    track({ type: "claim_generated", claimId: claim.id });
    addClaim(claim);
    navigate(`/claims/${claim.id}`);
  }

  if (loading) return (
    <div className="dashboard-page" aria-busy="true">
      <div className="skeleton skeleton-header" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" />
      <span className="sr-only">Loading dashboard data…</span>
    </div>
  );

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <div className="scenario-selector">
        <label htmlFor="scenario-select">Scenario: </label>
        <select
          id="scenario-select"
          value={activeScenario.id}
          onChange={(e) => handleScenarioChange(e.target.value)}
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <section className="dashboard-section">
        <h2>Active Trips</h2>
        <div className="dashboard-grid">
          {trips.map((trip) => (
            <div key={trip.id} className="trip-group">
              <h3 className="trip-name">{trip.name}</h3>
              <div className="trip-legs">
                {trip.legs.map((leg) => (
                  <FlightCard key={leg.id} leg={leg} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Disruption Alerts</h2>
        {disruptions.length === 0 ? (
          <p className="empty">No active disruptions.</p>
        ) : (
          <div className="disruption-list" aria-live="polite">
            {disruptions.map((d) => (
              <div key={d.id} className="disruption-card">
                <DisruptionBadge type={d.type} severity={d.severity} />
                <p className="disruption-summary">
                  {d.summary}
                  {d.delayMinutes !== undefined && (
                    <span className="disruption-delay"> ({d.delayMinutes} min delay)</span>
                  )}
                </p>
                {d.eligibility && <EligibilityCard eligibility={d.eligibility} />}
                {rebookMap[d.id] && <RebookOptionsCard options={rebookMap[d.id]} />}
                {d.eligibility?.status === "eligible" && (
                  <button
                    className="generate-claim-btn"
                    aria-label={hasClaimForDisruption(d.id) ? "Claim already created" : "Generate compensation claim"}
                    disabled={hasClaimForDisruption(d.id)}
                    onClick={() => handleGenerateClaim(d)}
                  >
                    {hasClaimForDisruption(d.id) ? "Claim Created" : "Generate Claim"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
