import { useEffect, useState } from "react";
import type { TravelerProfile } from "../types/traveler.ts";
import type { SeatPreference, CabinClass } from "../types/traveler.ts";
import { getTravelerProfile } from "../services/traveler.ts";
import { getStored, setStored, STORAGE_KEYS } from "../services/storage.ts";
import "./SettingsPage.css";

type StoredPreferences = {
  seatPreference: SeatPreference;
  cabinClass: CabinClass;
  maxLayoverMinutes: number;
  preferredAirlines: string[];
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [seatPreference, setSeatPreference] = useState<SeatPreference>("no-preference");
  const [cabinClass, setCabinClass] = useState<CabinClass>("economy");
  const [maxLayover, setMaxLayover] = useState(120);
  const [airlinesText, setAirlinesText] = useState("");

  useEffect(() => {
    getTravelerProfile().then((p) => {
      setProfile(p);

      const stored = getStored<StoredPreferences>(STORAGE_KEYS.PREFERENCES);
      const prefs = stored ?? p.preferences;

      setSeatPreference(prefs.seatPreference);
      setCabinClass(prefs.cabinClass);
      setMaxLayover(prefs.maxLayoverMinutes);
      setAirlinesText(prefs.preferredAirlines.join(", "));

      setLoading(false);
    });
  }, []);

  function persistPreferences(updates: Partial<StoredPreferences>) {
    const current: StoredPreferences = {
      seatPreference,
      cabinClass,
      maxLayoverMinutes: maxLayover,
      preferredAirlines: airlinesText.split(",").map((s) => s.trim()).filter(Boolean),
      ...updates,
    };
    setStored(STORAGE_KEYS.PREFERENCES, current);
  }

  if (loading || !profile) return (
    <div className="settings-page" aria-busy="true">
      <div className="skeleton skeleton-header" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" />
      <span className="sr-only">Loading settings...</span>
    </div>
  );

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <section className="settings-card">
        <h2>Traveler Profile</h2>
        <dl className="settings-dl">
          <dt>Name</dt>
          <dd>{profile.firstName} {profile.lastName}</dd>
          <dt>Email</dt>
          <dd>{profile.email}</dd>
        </dl>
      </section>

      <section className="settings-card">
        <h2>Preferences</h2>
        <div className="settings-form">
          <label htmlFor="seat-pref">Seat</label>
          <select
            id="seat-pref"
            value={seatPreference}
            onChange={(e) => {
              const val = e.target.value as SeatPreference;
              setSeatPreference(val);
              persistPreferences({ seatPreference: val });
            }}
          >
            <option value="window">window</option>
            <option value="aisle">aisle</option>
            <option value="middle">middle</option>
            <option value="no-preference">no-preference</option>
          </select>

          <label htmlFor="cabin-class">Cabin</label>
          <select
            id="cabin-class"
            value={cabinClass}
            onChange={(e) => {
              const val = e.target.value as CabinClass;
              setCabinClass(val);
              persistPreferences({ cabinClass: val });
            }}
          >
            <option value="economy">economy</option>
            <option value="premium-economy">premium-economy</option>
            <option value="business">business</option>
            <option value="first">first</option>
          </select>

          <label htmlFor="max-layover">Max Layover (min)</label>
          <input
            id="max-layover"
            type="number"
            min={0}
            value={maxLayover}
            onChange={(e) => {
              const val = Number(e.target.value);
              setMaxLayover(val);
              persistPreferences({ maxLayoverMinutes: val });
            }}
          />

          <label htmlFor="preferred-airlines">Preferred Airlines</label>
          <input
            id="preferred-airlines"
            type="text"
            value={airlinesText}
            placeholder="LH, LX, OS"
            onChange={(e) => {
              setAirlinesText(e.target.value);
              const airlines = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
              persistPreferences({ preferredAirlines: airlines });
            }}
          />
        </div>
      </section>

      {profile.preferences.loyaltyPrograms.length > 0 && (
        <section className="settings-card">
          <h2>Loyalty Programs</h2>
          {profile.preferences.loyaltyPrograms.map((lp) => (
            <dl key={lp.number} className="settings-dl">
              <dt>Alliance</dt>
              <dd>{lp.alliance}</dd>
              <dt>Tier</dt>
              <dd>{lp.tier}</dd>
              <dt>Number</dt>
              <dd>{lp.number}</dd>
            </dl>
          ))}
        </section>
      )}
    </div>
  );
}
